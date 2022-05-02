# relay-control
Relay connected to a Raspberry-PI control

# How to Connect a Relay Board to a Raspberry Pi

## Welcome

In this tutorial I will show you how to connect a relay board to a Raspberry Pi, relays are an electromagnetic switch 
that allows you to control a high voltage electrical circuit by opening and closing contacts in another low voltage circuit.
On the Raspberry Pi the control circuit will be operated by our GPIO pins. 
A relay generally has 3 connection points on the controlled circuit side, Normally Open (NO), Normally
Closed (NC) and a Common, an important convention to note is that when a relay contact is normally open (NO) the relay is not energized.

To configure the relay board with a Raspberry Pi I am assuming that you are running the latest version of Raspbian and have the ability to connect to your Pi through SSH with Putty and FTP with Filezilla, or directly with a keyboard and monitor.

## Materials

- Raspberry Pi (2, 3 or 4)
- Micro SD Card
- Power Supply
- 1 Channel Relay Module
- Breadboard
- Jumper Wires
- Raspberry Pi Case (Optional)

When describing the physical pin connections I will be following the GPIO pin numbering convention shown below:


![gpio-numbers-pi2](https://user-images.githubusercontent.com/37834935/163717196-4cc701b7-647d-4bcd-ae16-114b431b0941.png#gh-dark-mode-only)


I'm going to use this Relay module:

![relay-1-channel](https://user-images.githubusercontent.com/37834935/163720586-d0cd0745-edbf-4b4c-8d0b-30a627488bf0.jpg)

As you can see, these are the specs:

### INPUT

The pins are marked on the PCB:

- GND – Connect 0V to this pin.
- SIG  – Controls this relay, active Low! Relay will turn on when this input goes below about 2.0V
- VCC – Connect 5V to this pin. Is used to power the opto couplers

### OUTPUT

The 1 channel relay module contain: 1 normally Open (NO), 1 normally closed (NC) and 1 common Pins (COM).

- COM- Common pin
- NC- Normally Closed, in which case NC is connected with COM when INT1 is set low and disconnected when INT1 is high
- NO- Normally Open, in which case NO is disconnected with COM1 when INT1 is set low and connected when INT1 is high

```
**NOTICE**
- The maximum DC load is 10A
- The maximum DC load voltage is 30V the maximum AC load is 10A 
- The maximum AC load voltage is 250V.
```

I used a Breadboard and Jumper Wires.

### Before we continue with this lesson, I will warn you here that we will use High Voltage

```
**Warning**: Working with AC current is Dangerous, Please exercise extreme caution and preferably consult a
professional to make any AC Power connections. Always disconnect the circuit from the mains when not in use
and mount in a secure, sealed enclosure to prevent accidental contact.
```

![images](https://user-images.githubusercontent.com/37834935/163721569-5ade3326-4494-4ae5-a49e-f5eb174611b0.png)

### Overview
In this example, I will show how to use a Raspberry Pi 4B board to control a relay to turn on/off the lamp.
The Raspberry needs to be turned off before any connection of wires.

#### Connection

1. BLACK jumper wire connects to the GND pin
2. RED jumper wire connects to the 5V pin
3. BROWN jumper wire connects to GPIO number 21

![get-file](https://user-images.githubusercontent.com/37834935/163721105-124bfa9d-94e5-49f9-9adb-42669308bade.jpg)

## For more information

+ Documentation is available at [PAI-TECH Knowledge-base](https://blog.pai-tech.org/knowledge-base).
+ Ask for help on the
[Email](mailto:community@pai-tech.org).



## License

Relay-Control Module is copyright (c) 2018-present PAI-TECH ARTIFICIAL INTELLIGENCE  <contact@pai-tech.org>.

Relay-Control Module is free software, licensed under the GNU General Public License, Version 3.0. See the
`LICENSE` file for more details.
