using Microsoft.Windows.Devices.Midi2;
using Microsoft.Windows.Devices.Midi2.Endpoints.Virtual;
using Microsoft.Windows.Devices.Midi2.Messages;
using System.Runtime.InteropServices;

const string ProductInstanceId = "SIMMIDI000000000000000000000001";

var options = Options.Parse(args);
using var shutdown = new ManualResetEventSlim(false);

Console.CancelKeyPress += (_, eventArgs) =>
{
    eventArgs.Cancel = true;
    shutdown.Set();
};

try
{
    if (!MidiVirtualDeviceManager.IsTransportAvailable)
    {
        Console.Error.WriteLine("Windows MIDI Services Virtual Device transport is not available.");
        Console.Error.WriteLine("Install/enable the Windows MIDI Services SDK Runtime and Tools, then try again.");
        Environment.ExitCode = 2;
        return;
    }

    var config = CreateVirtualDeviceConfig(options.DeviceName);
    using var session = MidiSession.Create($"{options.DeviceName} host");
    var virtualDevice = MidiVirtualDeviceManager.CreateVirtualDevice(config);

    var clientEndpointId = MidiVirtualDeviceManager.GetAssociatedClientEndpointDeviceId(config.AssociationId);
    var connection = session.CreateEndpointConnection(virtualDevice.DeviceEndpointDeviceId);

    connection.AddMessageProcessingPlugin(virtualDevice);
    virtualDevice.StreamConfigRequestReceived += OnStreamConfigRequestReceived;
    connection.MessageReceived += OnMidiMessageReceived;

    if (!connection.Open())
    {
        Console.Error.WriteLine("Failed to open the virtual MIDI device-side endpoint.");
        Environment.ExitCode = 3;
        return;
    }

    Console.WriteLine($"Virtual MIDI device is running: {options.DeviceName}");
    Console.WriteLine($"Device endpoint id: {virtualDevice.DeviceEndpointDeviceId}");
    Console.WriteLine($"Client endpoint id: {clientEndpointId}");
    Console.WriteLine("Open MobiFlight and look for the device name above. Press Ctrl+C to stop.");

    using var testTimer = options.SendTestCc
        ? new Timer(_ => SendTestControlChange(connection), null, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(2))
        : null;

    if (options.DurationSeconds > 0)
    {
        shutdown.Wait(TimeSpan.FromSeconds(options.DurationSeconds));
    }
    else
    {
        shutdown.Wait();
    }
}
catch (Exception ex)
{
    if (ex is COMException { ErrorCode: unchecked((int)0x80040154) })
    {
        Console.Error.WriteLine("Windows MIDI Services SDK Runtime is not registered on this PC.");
        Console.Error.WriteLine("Install the Windows MIDI Services SDK Runtime and Tools package, then run this PoC again.");
        Environment.ExitCode = 4;
        return;
    }

    Console.Error.WriteLine("SIMMIDI virtual MIDI device PoC failed:");
    Console.Error.WriteLine(ex);
    Environment.ExitCode = 1;
}

static MidiVirtualDeviceCreationConfig CreateVirtualDeviceConfig(string deviceName)
{
    var declaredEndpointInfo = new MidiDeclaredEndpointInfo(
        deviceName,
        ProductInstanceId,
        true,
        true,
        false,
        false,
        true,
        1,
        1,
        1);

    var declaredDeviceIdentity = new MidiDeclaredDeviceIdentity(
        0x7D, 0x00, 0x00,
        0x01, 0x00,
        0x01, 0x00,
        0x00, 0x00, 0x00, 0x01);

    var userSuppliedInfo = new MidiEndpointUserSuppliedInfo(
        deviceName,
        "SIMMIDI Stream Deck virtual MIDI device proof of concept",
        string.Empty,
        false,
        0,
        false);

    var config = new MidiVirtualDeviceCreationConfig(
        deviceName,
        "SIMMIDI virtual MIDI device",
        "SIMMIDI",
        declaredEndpointInfo,
        declaredDeviceIdentity,
        userSuppliedInfo)
    {
        CreateOnlyUmpEndpoints = false
    };

    config.FunctionBlocks.Add(new MidiFunctionBlock
    {
        Number = 0,
        Name = "SIMMIDI MIDI 1.0",
        IsActive = true,
        UIHint = MidiFunctionBlockUIHint.Bidirectional,
        FirstGroup = new MidiGroup { Index = 0 },
        GroupCount = 1,
        Direction = MidiFunctionBlockDirection.Bidirectional,
        RepresentsMidi10Connection = MidiFunctionBlockRepresentsMidi10Connection.YesBandwidthUnrestricted,
        MaxSystemExclusive8Streams = 0,
        MidiCIMessageVersionFormat = 0
    });

    return config;
}

static void OnStreamConfigRequestReceived(MidiVirtualDevice sender, MidiStreamConfigRequestReceivedEventArgs args)
{
    Console.WriteLine(
        $"stream config request: protocol={args.PreferredMidiProtocol}, " +
        $"rxJitter={args.RequestEndpointReceiveJitterReductionTimestamps}, " +
        $"txJitter={args.RequestEndpointTransmitJitterReductionTimestamps}");
}

static void OnMidiMessageReceived(IMidiMessageReceivedEventSource sender, MidiMessageReceivedEventArgs args)
{
    var word = args.PeekFirstWord();
    var messageType = (word >> 28) & 0x0F;

    if (messageType != 0x02)
    {
        Console.WriteLine($"midi message: type={args.MessageType}, packet={args.PacketType}, word0=0x{word:X8}");
        return;
    }

    var group = (word >> 24) & 0x0F;
    var status = (byte)((word >> 16) & 0xFF);
    var data1 = (byte)((word >> 8) & 0xFF);
    var data2 = (byte)(word & 0xFF);
    var command = status & 0xF0;
    var channel = (status & 0x0F) + 1;

    var label = command switch
    {
        0x80 => "note off",
        0x90 => "note on",
        0xB0 => "control change",
        _ => $"status 0x{status:X2}"
    };

    Console.WriteLine(
        $"midi1 {label}: group={group + 1}, channel={channel}, data1={data1}, data2={data2}, word0=0x{word:X8}");
}

static void SendTestControlChange(MidiEndpointConnection connection)
{
    var group = new MidiGroup { Index = 0 };
    var channel = new MidiChannel { Index = 0 };
    var value = (byte)(DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 2 == 0 ? 127 : 0);

    var message = MidiMessageBuilder.BuildMidi1ChannelVoiceMessage(
        0,
        group,
        Midi1ChannelVoiceMessageStatus.ControlChange,
        channel,
        42,
        value);

    var result = connection.SendSingleMessagePacket(message);
    Console.WriteLine($"sent test CC: channel=1, controller=42, value={value}, result={result}");
}

internal sealed record Options(string DeviceName, bool SendTestCc, int DurationSeconds)
{
    public static Options Parse(string[] args)
    {
        var deviceName = "SIMMIDI";
        var sendTestCc = false;
        var durationSeconds = 0;

        for (var i = 0; i < args.Length; i++)
        {
            switch (args[i])
            {
                case "--name" when i + 1 < args.Length:
                    deviceName = args[++i];
                    break;
                case "--send-test-cc":
                    sendTestCc = true;
                    break;
                case "--duration-seconds" when i + 1 < args.Length && int.TryParse(args[i + 1], out var duration):
                    durationSeconds = Math.Max(0, duration);
                    i++;
                    break;
            }
        }

        return new Options(deviceName, sendTestCc, durationSeconds);
    }
}
