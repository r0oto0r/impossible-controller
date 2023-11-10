#!/bin/bash

# References:
# https://www.isticktoit.net/?p=1383
# http://irq5.io/2016/12/22/raspberry-pi-zero-as-multiple-usb-gadgets/

cd /sys/kernel/config/usb_gadget/

mkdir -p pi4
cd pi4
echo 0x1d6b > idVendor # Linux Foundation
echo 0x0104 > idProduct # Multifunction Composite Gadget
echo 0x0100 > bcdDevice # v1.0.0
echo 0x0200 > bcdUSB # USB2

mkdir -p strings/0x409
echo "fedcba3103198786" > strings/0x409/serialnumber
echo "Ben" > strings/0x409/manufacturer
echo "Impossible Controller" > strings/0x409/product

mkdir -p functions/hid.usb0
mkdir -p functions/hid.usb1

mkdir -p configs/c.1
echo 250 > configs/c.1/MaxPower

# Keyboard
echo 1 > functions/hid.usb0/protocol
echo 1 > functions/hid.usb0/subclass
echo 8 > functions/hid.usb0/report_length
echo -ne \\x05\\x01\\x09\\x06\\xa1\\x01\\x05\\x07\\x19\\xe0\\x29\\xe7\\x15\\x00\\x25\\x01\\x75\\x01\\x95\\x08\\x81\\x02\\x95\\x01\\x75\\x08\\x81\\x03\\x95\\x05\\x75\\x01\\x05\\x08\\x19\\x01\\x29\\x05\\x91\\x02\\x95\\x01\\x75\\x03\\x91\\x03\\x95\\x06\\x75\\x08\\x15\\x00\\x25\\x65\\x05\\x07\\x19\\x00\\x29\\x65\\x81\\x00\\xc0 > functions/hid.usb0/report_desc
ln -s functions/hid.usb0 configs/c.1
# End Keyboard

# Mouse
# HID Discriptor for Mouse Obtained Here: https://gist.github.com/dweinstein/7aa5bbc88364af75d5a4
echo 2 > functions/hid.usb1/protocol
echo 0 > functions/hid.usb1/subclass
echo 8 > functions/hid.usb1/report_length
echo -ne \\x05\\x01\\x09\\x02\\xA1\\x01\\x09\\x01\\xA1\\x00\\x05\\x09\\x19\\x01\\x29\\x03\\x15\\x00\\x25\\x01\\x95\\x03\\x75\\x01\\x81\\x02\\x95\\x01\\x75\\x05\\x81\\x01\\x05\\x01\\x09\\x30\\x09\\x31\\x15\\x81\\x25\\x7F\\x75\\x08\\x95\\x02\\x81\\x06\\xC0\\xC0 > functions/hid.usb1/report_desc
ln -s functions/hid.usb1 configs/c.1
# End Mouse

ls /sys/class/udc > UDC

chmod 777 /dev/hidg0
chmod 777 /dev/hidg1
