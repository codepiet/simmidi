# MIDI Board Overview

This list of Airbus Widgets have been taken from the file `mobiflight/streamdeck.midiboard.json`. We have defined about 160 devices and over 200 reactions.

| Device | Input Sends | Output State / Other | Lower ANN | Upper ANN | ANN |
|---|---:|---:|---:|---:|---:|
| ADIRS - ADIR1 | Note ch10:43 | State: CC ch10:43 on=1/off=0<br>State 2: CC ch10:43 on=2 | - | - | - |
| ADIRS - ADIR2 | Note ch10:44 | State: CC ch10:44 on=1/off=0<br>State 2: CC ch10:44 on=2 | - | - | - |
| ADIRS - ADIR3 | Note ch10:45 | State: CC ch10:45 on=1/off=0<br>State 2: CC ch10:45 on=2 | - | - | - |
| ADIRS - ADR1 | Note ch10:46 | - | CC ch10:46 on=1/off=0 | CC ch11:46 on=1/off=0 | - |
| ADIRS - ADR2 | Note ch10:47 | - | CC ch10:47 on=1/off=0 | CC ch11:47 on=1/off=0 | - |
| ADIRS - ADR3 | Note ch10:48 | - | CC ch10:48 on=1/off=0 | CC ch11:48 on=1/off=0 | - |
| ADIRS - IR1 | Note ch10:40 | - | CC ch10:40 on=1/off=0 | CC ch11:40 on=1/off=0 | - |
| ADIRS - IR2 | Note ch10:41 | - | CC ch10:41 on=1/off=0 | CC ch11:41 on=1/off=0 | - |
| ADIRS - IR3 | Note ch10:42 | - | CC ch10:42 on=1/off=0 | CC ch11:42 on=1/off=0 | - |
| ADIRS - ONBAT | Note ch10:49 | - | - | - | CC ch11:49 on=1/off=0 |
| AIRCOND - AFT CABIN | Note ch10:88 | State: CC ch10:88 on=1/off=0 | - | - | - |
| AIRCOND - APU BLEED | Note ch10:82 | - | CC ch10:82 on=1/off=0 | CC ch11:82 on=1/off=0 | - |
| AIRCOND - COCKPIT | Note ch10:86 | State: CC ch10:86 on=1/off=0 | - | - | - |
| AIRCOND - ENG1 BLEED | Note ch10:80 | - | CC ch10:80 on=1/off=0 | CC ch11:80 on=1/off=0 | - |
| AIRCOND - ENG2 BLEED | Note ch10:83 | - | CC ch10:83 on=1/off=0 | CC ch11:83 on=1/off=0 | - |
| AIRCOND - FWD CABIN | Note ch10:87 | State: CC ch10:87 on=1/off=0 | - | - | - |
| AIRCOND - HOT AIR | Note ch10:78 | - | CC ch10:78 on=1/off=0 | CC ch11:78 on=1/off=0 | - |
| AIRCOND - PACK FLOW | Note ch10:85 | State: CC ch10:85 on=1/off=0 | - | - | - |
| AIRCOND - PACK1 | Note ch10:79 | - | CC ch10:79 on=1/off=0 | CC ch11:79 on=1/off=0 | - |
| AIRCOND - PACK2 | Note ch10:84 | - | CC ch10:84 on=1/off=0 | CC ch11:84 on=1/off=0 | - |
| AIRCOND - RAM AIR | Note ch10:81 | - | CC ch10:81 on=1/off=0 | CC ch11:81 on=1/off=0 | - |
| AIRCOND - XBLEED | Note ch10:89 | State: CC ch10:89 on=1/off=0 | - | - | - |
| ANTI ICE - ENG1 | Note ch10:71 | - | CC ch10:71 on=1/off=0 | CC ch11:71 on=1/off=0 | - |
| ANTI ICE - ENG2 | Note ch10:72 | - | CC ch10:72 on=1/off=0 | CC ch11:72 on=1/off=0 | - |
| ANTI ICE - WING | Note ch10:70 | - | CC ch10:70 on=1/off=0 | CC ch11:70 on=1/off=0 | - |
| APU - MASTER | Note ch10:58 | - | CC ch10:58 on=1/off=0 | CC ch11:58 on=1/off=0 | - |
| APU - START | Note ch10:59 | - | CC ch10:59 on=1/off=0 | CC ch11:59 on=1/off=0 | - |
| ATCTCAS - ALT RPTG | Note ch12:32 | State: CC ch12:32 on=1/off=0 | - | - | - |
| ATCTCAS - ATC FAIL | - | State: CC ch12:35 on=1/off=0 | - | - | - |
| ATCTCAS - CLR | Note ch12:28 | - | - | - | - |
| ATCTCAS - IDENT | Note ch12:29 | - | - | - | - |
| ATCTCAS - MODE SEL | Note ch12:30 | State: CC ch12:30 on=1/off=0<br>State 2: CC ch12:30 on=2 | - | - | - |
| ATCTCAS - NUM0 | Note ch12:20 | - | - | - | - |
| ATCTCAS - NUM1 | Note ch12:21 | - | - | - | - |
| ATCTCAS - NUM2 | Note ch12:22 | - | - | - | - |
| ATCTCAS - NUM3 | Note ch12:23 | - | - | - | - |
| ATCTCAS - NUM4 | Note ch12:24 | - | - | - | - |
| ATCTCAS - NUM5 | Note ch12:25 | - | - | - | - |
| ATCTCAS - NUM6 | Note ch12:26 | - | - | - | - |
| ATCTCAS - NUM7 | Note ch12:27 | - | - | - | - |
| ATCTCAS - TCAS MODE | Note ch12:33 | State: CC ch12:33 on=1/off=0<br>State 2: CC ch12:33 on=2 | - | - | - |
| ATCTCAS - TCAS TRAFFIC | Note ch12:34 | State: CC ch12:34 on=1/off=0<br>State 2: CC ch12:34 on=2<br>State 3: CC ch12:34 on=3 | - | - | - |
| ATCTCAS - XPDR SEL | Note ch12:31 | State: CC ch12:31 on=1/off=0 | - | - | - |
| CABIN PRESS - DITCHING | Note ch10:77 | - | CC ch10:77 on=1/off=0 | CC ch11:77 on=1/off=0 | - |
| CABIN PRESS - LDG ELEV | Note ch10:76 | - | - | - | - |
| CABIN PRESS - MAN CTL | Note ch10:74 | State: CC ch10:74 on=1/off=0 | - | - | - |
| CABIN PRESS - MODE | - | - | CC ch10:75 on=1/off=0 | CC ch11:75 on=1/off=0 | - |
| CABIN PRESS - MODE SEL | Note ch10:75 | - | - | - | - |
| CALLS - AFT | Note ch10:8 | - | - | - | - |
| CALLS - ALL | Note ch10:6 | - | - | - | - |
| CALLS - EMER | Note ch10:9 | - | - | - | - |
| CALLS - FWD | Note ch10:7 | - | - | - | - |
| CALLS - MECH | Note ch10:5 | - | - | - | - |
| CARGO SMOKE - AFT | Note ch12:12 | - | - | - | - |
| CARGO SMOKE - AFT SW | Note ch12:13 | - | - | - | - |
| CARGO SMOKE - ANN1 | Note ch12:15 | - | - | - | - |
| CARGO SMOKE - ANN2 | Note ch12:16 | - | - | - | - |
| CARGO SMOKE - FWD | Note ch12:10 | - | - | - | - |
| CARGO SMOKE - FWD SW | Note ch12:11 | - | - | - | - |
| CARGO SMOKE - TEST | Note ch12:14 | - | - | - | - |
| CARGO VENT - ISOL VALVE | Note ch12:17 | - | - | - | - |
| ELEC - AC ESS FEED | Note ch10:93 | - | CC ch10:93 on=1/off=0 | CC ch11:93 on=1/off=0 | - |
| ELEC - APU GEN | Note ch10:97 | - | CC ch10:97 on=1/off=0 | CC ch11:97 on=1/off=0 | - |
| ELEC - BAT1 | Note ch10:91 | - | CC ch10:91 on=1/off=0 | CC ch11:91 on=1/off=0 | - |
| ELEC - BAT2 | Note ch10:92 | - | CC ch10:92 on=1/off=0 | CC ch11:92 on=1/off=0 | - |
| ELEC - BUS TIE | Note ch10:98 | - | CC ch10:98 on=1/off=0 | CC ch11:98 on=1/off=0 | - |
| ELEC - COMM | Note ch10:90 | - | CC ch10:90 on=1/off=0 | CC ch11:90 on=1/off=0 | - |
| ELEC - EXT PWR | Note ch10:99 | - | CC ch10:99 on=1/off=0 | CC ch11:99 on=1/off=0 | - |
| ELEC - GALY CAB | Note ch10:94 | - | CC ch10:94 on=1/off=0 | CC ch11:94 on=1/off=0 | - |
| ELEC - GEN1 | Note ch10:96 | - | CC ch10:96 on=1/off=0 | CC ch11:96 on=1/off=0 | - |
| ELEC - GEN2 | Note ch10:100 | - | CC ch10:100 on=1/off=0 | CC ch11:100 on=1/off=0 | - |
| ELEC - IDG1 | Note ch10:95 | - | CC ch10:95 on=1/off=0 | CC ch11:95 on=1/off=0 | - |
| ELEC - IDG2 | Note ch10:101 | - | CC ch10:101 on=1/off=0 | CC ch11:101 on=1/off=0 | - |
| EMER ELEC PWR - EMER | - | - | CC ch10:25 on=1/off=0 | CC ch11:25 on=1/off=0 | - |
| EMER ELEC PWR - EMER TEST | Note ch10:25 | - | - | - | - |
| EMER ELEC PWR - GEN1 LINE | Note ch10:26 | - | CC ch10:26 on=1/off=0 | CC ch11:26 on=1/off=0 | - |
| EMER ELEC PWR - MAN ON | Note ch10:28 | - | - | - | - |
| EMER ELEC PWR - RAT | Note ch10:27 | - | CC ch10:27 on=1/off=0 | CC ch11:27 on=1/off=0 | - |
| ENG - MAN START 1 | Note ch12:1 | - | - | - | - |
| ENG - MAN START 2 | Note ch12:2 | - | - | - | - |
| EVAC - CAPTPURS | Note ch10:32 | - | - | - | - |
| EVAC - COMMAND | Note ch10:30 | - | CC ch10:30 on=1/off=0 | CC ch11:30 on=1/off=0 | - |
| EVAC - HORN | Note ch10:31 | - | - | - | - |
| EVAC - PURSCAPT | - | State: CC ch10:32 on=1/off=0 | - | - | - |
| EXT LT - BEACON | Note ch10:51 | State: CC ch10:51 on=1/off=0 | - | - | - |
| EXT LT - LAND L | Note ch10:55 | State: CC ch10:55 on=1/off=0<br>State 2: CC ch10:55 on=2 | - | - | - |
| EXT LT - LAND R | Note ch10:56 | State: CC ch10:56 on=1/off=0<br>State 2: CC ch10:56 on=2 | - | - | - |
| EXT LT - NAV LOGO | Note ch10:53 | State: CC ch10:53 on=1/off=0<br>State 2: CC ch10:53 on=2 | - | - | - |
| EXT LT - NOSE | Note ch10:57 | State: CC ch10:57 on=1/off=0<br>State 2: CC ch10:57 on=2 | - | - | - |
| EXT LT - RWY TURNOFF | Note ch10:54 | State: CC ch10:54 on=1/off=0 | - | - | - |
| EXT LT - STROBE | Note ch10:50 | State: CC ch10:50 on=1/off=0<br>State 2: CC ch10:50 on=2 | - | - | - |
| EXT LT - WING | Note ch10:52 | State: CC ch10:52 on=1/off=0 | - | - | - |
| FIRE - APU AGENT | Note ch10:126 | - | CC ch10:126 on=1/off=0 | CC ch11:126 on=1/off=0 | - |
| FIRE - APU FIRE | Note ch10:124 | State: CC ch10:124 on=1/off=0 | - | - | - |
| FIRE - APU TEST | Note ch10:125 | - | - | - | - |
| FIRE - ENG1 AGENT1 | Note ch10:118 | - | CC ch10:118 on=1/off=0 | CC ch11:118 on=1/off=0 | - |
| FIRE - ENG1 AGENT2 | Note ch10:119 | - | CC ch10:119 on=1/off=0 | CC ch11:119 on=1/off=0 | - |
| FIRE - ENG1 FIRE | Note ch10:116 | State: CC ch10:116 on=1/off=0 | - | - | - |
| FIRE - ENG1 TEST | Note ch10:117 | - | - | - | - |
| FIRE - ENG2 AGENT1 | Note ch10:122 | - | CC ch10:122 on=1/off=0 | CC ch11:122 on=1/off=0 | - |
| FIRE - ENG2 AGENT2 | Note ch10:123 | - | CC ch10:123 on=1/off=0 | CC ch11:123 on=1/off=0 | - |
| FIRE - ENG2 FIRE | Note ch10:120 | State: CC ch10:120 on=1/off=0 | - | - | - |
| FIRE - ENG2 TEST | Note ch10:121 | - | - | - | - |
| FLT CTL CPT - ELAC1 | Note ch10:33 | - | CC ch10:33 on=1/off=0 | CC ch11:33 on=1/off=0 | - |
| FLT CTL CPT - FAC1 | Note ch10:35 | - | CC ch10:35 on=1/off=0 | CC ch11:35 on=1/off=0 | - |
| FLT CTL CPT - SEC1 | Note ch10:34 | - | CC ch10:34 on=1/off=0 | CC ch11:34 on=1/off=0 | - |
| FLT CTL FO - ELAC2 | Note ch10:36 | - | CC ch10:36 on=1/off=0 | CC ch11:36 on=1/off=0 | - |
| FLT CTL FO - FAC2 | Note ch10:39 | - | CC ch10:39 on=1/off=0 | CC ch11:39 on=1/off=0 | - |
| FLT CTL FO - SEC2 | Note ch10:37 | - | CC ch10:37 on=1/off=0 | CC ch11:37 on=1/off=0 | - |
| FLT CTL FO - SEC3 | Note ch10:38 | - | CC ch10:38 on=1/off=0 | CC ch11:38 on=1/off=0 | - |
| FUEL - MODESEL | Note ch10:108 | - | CC ch10:108 on=1/off=0 | CC ch11:108 on=1/off=0 | - |
| FUEL - PUMP CTK1 | Note ch10:104 | - | CC ch10:104 on=1/off=0 | CC ch11:104 on=1/off=0 | - |
| FUEL - PUMP CTK2 | Note ch10:105 | - | CC ch10:105 on=1/off=0 | CC ch11:105 on=1/off=0 | - |
| FUEL - PUMP LTK1 | Note ch10:102 | - | CC ch10:102 on=1/off=0 | CC ch11:102 on=1/off=0 | - |
| FUEL - PUMP LTK2 | Note ch10:103 | - | CC ch10:103 on=1/off=0 | CC ch11:103 on=1/off=0 | - |
| FUEL - PUMP RTK1 | Note ch10:106 | - | CC ch10:106 on=1/off=0 | CC ch11:106 on=1/off=0 | - |
| FUEL - PUMP RTK2 | Note ch10:107 | - | CC ch10:107 on=1/off=0 | CC ch11:107 on=1/off=0 | - |
| FUEL - XFEED | Note ch10:109 | - | CC ch10:109 on=1/off=0 | CC ch11:109 on=1/off=0 | - |
| GPWS - FLAP MODE | Note ch10:23 | - | - | - | CC ch10:23 on=1/off=0 |
| GPWS - GS MODE | Note ch10:22 | - | - | - | CC ch10:22 on=1/off=0 |
| GPWS - LDG FLAP3 | Note ch10:24 | - | - | - | CC ch10:24 on=1/off=0 |
| GPWS - SYS | Note ch10:21 | - | CC ch10:21 on=1/off=0 | CC ch11:21 on=1/off=0 | - |
| GPWS - TERR | Note ch10:20 | - | CC ch10:20 on=1/off=0 | CC ch11:20 on=1/off=0 | - |
| HYD - BLUE ELEC PUMP | Note ch10:112 | - | CC ch10:112 on=1/off=0 | CC ch11:112 on=1/off=0 | - |
| HYD - GREEN ENG1 PUMP | Note ch10:111 | - | CC ch10:111 on=1/off=0 | CC ch11:111 on=1/off=0 | - |
| HYD - PTU | Note ch10:113 | - | CC ch10:113 on=1/off=0 | CC ch11:113 on=1/off=0 | - |
| HYD - RAT MAN ON | Note ch10:110 | State: CC ch10:110 on=1/off=0 | - | - | - |
| HYD - YELLOW ELEC PUMP | Note ch10:115 | - | CC ch10:115 on=1/off=0 | CC ch11:115 on=1/off=0 | - |
| HYD - YELLOW ENG2 PUMP | Note ch10:114 | - | CC ch10:114 on=1/off=0 | CC ch11:114 on=1/off=0 | - |
| INT LT - ANN LT | Note ch10:67 | State: CC ch10:67 on=1/off=0<br>State 2: CC ch10:67 on=2 | - | - | - |
| INT LT - DOME | Note ch10:66 | State: CC ch10:66 on=1/off=0<br>State 2: CC ch10:66 on=2 | - | - | - |
| INT LT - ICE IND | Note ch10:65 | State: CC ch10:65 on=1/off=0 | - | - | - |
| INT LT - OVHD INT LT | Note ch10:64 | - | - | - | - |
| LEFT - COCKPIT DOOR VIDEO | Note ch10:19 | - | CC ch10:19 on=1/off=0 | CC ch11:19 on=1/off=0 | - |
| OXYGEN - CREW SUPPLY | Note ch10:13 | - | CC ch10:13 on=1/off=0 | CC ch11:13 on=1/off=0 | - |
| OXYGEN - HIGH ALT | Note ch10:10 | - | CC ch10:10 on=1/off=0 | CC ch11:10 on=1/off=0 | - |
| OXYGEN - MASK MAN | Note ch10:11 | - | - | - | - |
| OXYGEN - PAX | Note ch10:12 | - | CC ch10:12 on=1/off=0 | CC ch11:12 on=1/off=0 | - |
| PROBE - HEAT | Note ch10:73 | - | CC ch10:73 on=1/off=0 | CC ch11:73 on=1/off=0 | - |
| RAIN CPT - RPLNT | Note ch10:1 | - | - | - | - |
| RAIN CPT - WIPER | Note ch10:2 | State: CC ch10:2 on=1/off=0<br>State 2: CC ch10:2 on=2 | - | - | - |
| RAIN FO - RPLNT | Note ch10:3 | - | - | - | - |
| RAIN FO - WIPER | Note ch10:4 | State: CC ch10:4 on=1/off=0<br>State 2: CC ch10:4 on=2 | - | - | - |
| RCDR - CVR ERASE | Note ch10:15 | - | - | - | - |
| RCDR - CVR TEST | Note ch10:16 | - | - | - | - |
| RCDR - GND CTL | Note ch10:14 | - | CC ch10:14 on=1/off=0 | CC ch11:14 on=1/off=0 | - |
| SIGNS - EMER EXIT LT | Note ch10:63 | State: CC ch10:63 on=1/off=0<br>State 2: CC ch10:63 on=2<br>Output: CC ch10:62 on=1/off=0 | - | - | - |
| SIGNS - NOSMOKE | Note ch10:61 | State: CC ch10:61 on=1/off=0<br>State 2: CC ch10:61 on=2 | - | - | - |
| SIGNS - SEAT | Note ch10:60 | State: CC ch10:60 on=1/off=0 | - | - | - |
| VENTILATION - BLOWER | Note ch12:3 | - | - | - | - |
| VENTILATION - CAB FANS | Note ch12:5 | - | - | - | - |
| VENTILATION - EXTRACT | Note ch12:4 | - | - | - | - |
| WRNPNL CPT - AUTOLAND | - | - | CC ch12:18 on=1/off=0 | CC ch13:18 on=1/off=0 | - |
| WRNPNL CPT - CHRONO | Note ch12:8 | - | - | - | - |
| WRNPNL CPT - MASTER CAUT | Note ch12:7 | - | CC ch12:7 on=1/off=0 | CC ch13:7 on=1/off=0 | - |
| WRNPNL CPT - MASTER WARN | Note ch12:6 | - | CC ch12:6 on=1/off=0 | CC ch13:6 on=1/off=0 | - |
| WRNPNL CPT - PRIO | Note ch12:9 | - | CC ch12:9 on=1/off=0 | CC ch13:9 on=1/off=0 | - |
| WRNPNL FO - AUTOLAND | - | - | CC ch12:40 on=1/off=0 | CC ch13:40 on=1/off=0 | - |
| WRNPNL FO - CHRONO | Note ch12:38 | - | - | - | - |
| WRNPNL FO - MASTER CAUT | Note ch12:37 | - | CC ch12:37 on=1/off=0 | CC ch13:37 on=1/off=0 | - |
| WRNPNL FO - MASTER WARN | Note ch12:36 | - | CC ch12:36 on=1/off=0 | CC ch13:36 on=1/off=0 | - |
| WRNPNL FO - PRIO | Note ch12:39 | - | CC ch12:39 on=1/off=0 | CC ch13:39 on=1/off=0 | - |
