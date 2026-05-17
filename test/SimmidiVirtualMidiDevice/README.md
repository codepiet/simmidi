# SIMMIDI Virtual MIDI Device PoC

This is a small Windows MIDI Services proof of concept. It tries to publish a
virtual app-to-app MIDI device named `SIMMIDI`, opens the device-side endpoint,
logs incoming MIDI 1.0 channel voice messages, and can optionally send a test
Control Change message.

## Prerequisites

- Windows 11 with Windows MIDI Services enabled.
- Windows MIDI Services SDK Runtime and Tools installed.
- .NET 10 SDK.

If the app prints `Windows MIDI Services SDK Runtime is not registered on this
PC`, install the x64 `Windows.MIDI.Services.SDK.Runtime.and.Tools` package from
the Microsoft MIDI GitHub release that matches the vendored SDK package.

The SDK compile-time package is vendored in `packages/` because the RC4
`Microsoft.Windows.Devices.Midi2` package is distributed from the Microsoft MIDI
GitHub release assets, not from nuget.org.

## Build

```powershell
dotnet restore
dotnet build -p:Platform=x64
```

## Run

```powershell
dotnet run -p:Platform=x64
```

Optional custom device name:

```powershell
dotnet run -p:Platform=x64 -- --name SIMMIDI
```

Optional repeating test CC on channel 1, controller 42, value 0/127:

```powershell
dotnet run -p:Platform=x64 -- --send-test-cc
```

Short probe run, useful from scripts:

```powershell
dotnet run -p:Platform=x64 -- --duration-seconds 5
```

While the process is running, the client-side endpoint should be visible to
other MIDI applications. In MobiFlight, look for the device name (`SIMMIDI` by
default). Stop the host with `Ctrl+C`; the virtual device lifetime is tied to
this process.
