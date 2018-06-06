//Version 2

function generateConfig(form) {

            var eh1200Role;
	if (form.eh1200Asymmetrical.value == "75tx-25rx") {
		eh1200Role = "master";
	} else if (form.eh1200Asymmetrical.value == "25tx-75rx") {
		eh1200Role = "slave";
	} else {
		eh1200Role = "auto";
	}

            var eh2500ChannelWidth = "";
            if(parseInt(form.eh2500ChannelWidth.value.match(/\d+/), 10) || form.radioModel.value == "EH1200TL") {
                        eh2500ChannelWidth = parseInt(form.eh2500ChannelWidth.value.match(/\d+/), 10);
            } else {
                        alert("Channel width invalid!");
                        throw new Error("Channel width invalid!");
            }

            var cidrPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]{1}|[1-2]{1}[0-9]?|3[0-2])$/;
            var ipPatternMatch = [];

            if(cidrPattern.exec(form.ipAddress.value)) {
                        ipPatternMatch = cidrPattern.exec(form.ipAddress.value);
            } else {
                        alert("IP address invalid");
                        throw new Error("IP address invalid");
            }

            var parsedIpAddress = ipPatternMatch[1] + "." + ipPatternMatch[2] + "." + ipPatternMatch[3] + "." + ipPatternMatch[4];
            var subnetPrefix = ipPatternMatch[5];
            var ipBinary = [
                        Number(ipPatternMatch[1]).toString(2),
                        Number(ipPatternMatch[2]).toString(2),
                        Number(ipPatternMatch[3]).toString(2),
                        Number(ipPatternMatch[4]).toString(2)
            ];
            for(var i = 0; i < ipBinary.length; i++) {
                        while(ipBinary[i].length < 8) {
                                    ipBinary[i] = "0" + ipBinary[i];
                        }
            }
            ipBinary = ipBinary.join("");
            var networkAddress = "";
            for(var i = 0; i < 32; i++) {
                        var aBit = ipBinary.substr(i, 1);
                        if (i < subnetPrefix) {
                                    networkAddress += aBit.toString();
                        } else { networkAddress += "0"; }
            }
            var arrNetworkAddress = networkAddress.match(/[0-1]{8}/g);
            var arrGatewayAddress = ["", "", "", ""];
            for(var i = 0; i < arrNetworkAddress.length; i++) {
                        if(i == arrNetworkAddress.length-1) {
                                    var lastOctet = arrNetworkAddress[i].substr(0,7);
                                    lastOctet += "1";
                                    arrGatewayAddress[i] += parseInt(lastOctet, 2);
                        } else {
                                    arrGatewayAddress[i] += parseInt(arrNetworkAddress[i], 2);
                        }
            }
            var parsedGatewayAddress = arrGatewayAddress.join(".");
	var systemName = "set system contact noc@vivintwireless.com name " + form.systemName.value;
	var ipAddress = "set ip 2 ip-addr " + parsedIpAddress + " prefix-len " + subnetPrefix + " vlan 2";
	var eh1200Frequency = "set rf frequency " + form.eh1200Frequency.value + " mode adaptive tx-asymmetry " + form.eh1200Asymmetrical.value + " role " + eh1200Role;
            if(form.eh2500Frequency.value != null || form.radioModel.value == "EH1200TL") {
                        var eh2500Frequency = "set rf frequency " + eh2500ChannelWidth + " " + form.eh2500Frequency.value;
            } else {
                        alert("Frequency invalid!");
                        throw new Error("Frequency invalid!");
            }
            if((parseInt(form.eh2500TxPower.value, 10) >= -35 && parseInt(form.eh2500TxPower.value, 10) <= 17)|| form.radioModel.value == "EH1200TL") {
                       var eh2500TxPower = "set rf tx-power " + form.eh2500TxPower.value;
            } else {
                        alert("TX Power invalid!");
                        throw new Error("TX Power invalid!");
            }
	var gatewayAddress = "set route 1 dest 0.0.0.0 prefix-len 0 next-hop " + parsedGatewayAddress;
	var portConfig = form.eh2500PortConfig.value;

	var password = config.password;
	var snmp = config.snmp;

	if(portConfig == "north") {
		var alias = [
			"set eth eth1 alias eNB",
			"set eth eth2 alias Customer",
			"set eth eth3 alias Downlink"
		];
		var vlans = [
			"set vlan s1 1 egress c1,c2,c3,c4,c5,c6 untagged none history disable",
			"set vlan s1 undef egress c1,c2,c3,c4,c5,c6 untagged none history disable",
			"set vlan c1 1 egress host,s1 untagged host,s1 history disable",
			"set vlan c1 2 egress host,s1 untagged none history disable",
			"set vlan c1 200 egress host,s1 untagged none history disable",
			"set vlan c1 undef egress host,s1 untagged none history disable",
			"set vlan c2 1-2 egress eth0,s1 untagged none history disable",
			"set vlan c2 200 egress eth0,s1 untagged none history disable",
			"set vlan c2 undef egress eth0,s1 untagged none history disable",
			"set vlan c3 1-2 egress eth1,s1 untagged none history disable",
			"set vlan c3 200 egress eth1,s1 untagged none history disable",
			"set vlan c3 undef egress eth1,s1 untagged none history disable",
			"set vlan c4 1 egress eth2,s1 untagged eth2,s1 history disable",
			"set vlan c4 2 egress eth2,s1 untagged none history disable",
			"set vlan c4 200 egress eth2,s1 untagged none history disable",
			"set vlan c4 undef egress eth2,s1 untagged none history disable",
			"set vlan c5 1-2 egress eth3,s1 untagged none history disable",
			"set vlan c5 200 egress eth3,s1 untagged none history disable",
			"set vlan c5 undef egress eth3,s1 untagged none history disable",
			"set vlan c6 1-2 egress eth4,s1 untagged none history disable",
			"set vlan c6 200 egress eth4,s1 untagged none history disable",
			"set vlan c6 undef egress eth4,s1 untagged none history disable"
		];
	} else if(portConfig = "south") {
		var alias = [
			"set eth eth1 alias Uplink",
			"set eth eth2 alias Raspberry Pi"
		];
		var vlans = [
			"set vlan s1 1 egress c1,c2,c3,c4,c5,c6 untagged none history disable",
			"set vlan s1 undef egress c1,c2,c3,c4,c5,c6 untagged none history disable",
			"set vlan c1 1 egress host,s1 untagged host,s1 history disable",
			"set vlan c1 2 egress host,s1 untagged none history disable",
			"set vlan c1 200 egress host,s1 untagged none history disable",
			"set vlan c1 undef egress host,s1 untagged none history disable",
			"set vlan c2 1-2 egress eth0,s1 untagged none history disable",
			"set vlan c2 200 egress eth0,s1 untagged none history disable",
			"set vlan c2 undef egress eth0,s1 untagged none history disable",
			"set vlan c3 1-2 egress eth1,s1 untagged none history disable",
			"set vlan c3 200 egress eth1,s1 untagged none history disable",
			"set vlan c3 undef egress eth1,s1 untagged none history disable",
			"set vlan c4 1 egress eth2,s1 untagged none history disable",
			"set vlan c4 2 egress eth2,s1 untagged eth2 history disable",
			"set vlan c4 200 egress eth2,s1 untagged none history disable",
			"set vlan c4 undef egress eth2,s1 untagged none history disable",
			"set vlan c5 1-2 egress eth3,s1 untagged none history disable",
			"set vlan c5 200 egress eth3,s1 untagged none history disable",
			"set vlan c5 undef egress eth3,s1 untagged none history disable",
			"set vlan c6 1-2 egress eth4,s1 untagged none history disable",
			"set vlan c6 200 egress eth4,s1 untagged none history disable",
			"set vlan c6 undef egress eth4,s1 untagged none history disable"
		];
	}

	var eh1200Configuration = [
		"### START ###",
		"set vlan s1 1     egress c1,c2,c3,c4 untagged none history disable",
		"set vlan s1 undef egress c1,c2,c3,c4 untagged none history disable",
		"set vlan c1 1     egress host,s1     untagged host history disable",
		"set vlan c1 2     egress host,s1     untagged none history disable",
		"set vlan c1 undef egress host,s1     untagged none history disable",
		"set vlan c2 1     egress eth0,s1     untagged none history disable",
		"set vlan c2 2     egress eth0,s1     untagged none history disable",
		"set vlan c2 undef egress eth0,s1     untagged none history disable",
		"set vlan c3 1     egress eth1,s1     untagged none history disable",
		"set vlan c3 2     egress eth1,s1     untagged none history disable",
		"set vlan c3 undef egress eth1,s1     untagged none history disable",
		"set vlan c4 1     egress eth2,s1     untagged eth2 history disable",
		"set vlan c4 2     egress eth2,s1     untagged eth2 history disable",
		"set vlan c4 undef egress eth2,s1     untagged none history disable",
		"set modulation any   qpsk  1 4 0.5 cinr-low -128 cinr-high 10  backoff 5",
		"set modulation any   qpsk  2 2 0.5 cinr-low 6    cinr-high 13  backoff 6",
		"set modulation any   qpsk  4 1 0.5 cinr-low 9    cinr-high 14  backoff 6",
		"set modulation any   qam16 4 1 0.5 cinr-low 13   cinr-high 127 backoff 6",
		"set modulation 73875 qpsk  1 4 0.5 cinr-low -128 cinr-high 10  backoff 5",
		"set modulation 73875 qpsk  2 2 0.5 cinr-low 6    cinr-high 11  backoff 6",
		"set modulation 73875 qpsk  4 1 0.5 cinr-low 7    cinr-high 14  backoff 6",
		"set modulation 73875 qam16 4 1 0.5 cinr-low 13   cinr-high 127 backoff 6",
		"set modulation 74375 qpsk  1 4 0.5 cinr-low -128 cinr-high 10  backoff 5",
		"set modulation 74375 qpsk  2 2 0.5 cinr-low 6    cinr-high 11  backoff 6",
		"set modulation 74375 qpsk  4 1 0.5 cinr-low 7    cinr-high 14  backoff 6",
		"set modulation 74375 qam16 4 1 0.5 cinr-low 13   cinr-high 127 backoff 6",
		"set modulation 74875 qpsk  1 4 0.5 cinr-low -128 cinr-high 10  backoff 5",
		"set modulation 74875 qpsk  2 2 0.5 cinr-low 6    cinr-high 11  backoff 6",
		"set modulation 74875 qpsk  4 1 0.5 cinr-low 7    cinr-high 14  backoff 6",
		"set modulation 74875 qam16 4 1 0.5 cinr-low 13   cinr-high 127 backoff 6",
		"set modulation 75375 qpsk  1 4 0.5 cinr-low -128 cinr-high 10  backoff 5",
		"set modulation 75375 qpsk  2 2 0.5 cinr-low 6    cinr-high 11  backoff 6",
		"set modulation 75375 qpsk  4 1 0.5 cinr-low 7    cinr-high 14  backoff 6",
		"set modulation 75375 qam16 4 1 0.5 cinr-low 13   cinr-high 127 backoff 6",
                        "",
		"# Setup system parameters",
                        systemName,
                        password,
                        snmp,
                        "set ntp 1 server 10.252.245.131",
                        "set ntp 1 secondary-server 10.252.245.163",
                        "set ntp 1 tmz -7",
		ipAddress,
		gatewayAddress,
		eh1200Frequency,
		"copy running-configuration startup-configuration",
		"### END ###"
	];

            var eh2500Configuration = [
		"### START ###",
                        "# Setup modulation table",
                        "set modulation 250Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
                        "set modulation 250Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
                        "set modulation 250Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
                        "set modulation 250Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
                        "set modulation 250Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
                        "set modulation 500Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
                        "set modulation 500Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
                        "set modulation 500Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
                        "set modulation 500Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
                        "set modulation 500Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
                        "set modulation 750Mhz  qpsk1 cinr-low 11.5 cinr-high 16   backoff 7",
                        "set modulation 750Mhz  qam16 cinr-low 17   cinr-high 127  backoff 9",
                        "set modulation 750Mhz  bpsk1 cinr-low -128 cinr-high 12.5 backoff 7",
                        "set modulation 1250Mhz qpsk1 cinr-low 12   cinr-high 16   backoff 7",
                        "set modulation 1250Mhz bpsk1 cinr-low -128 cinr-high 13   backoff 7",
                        "set modulation-arq 250Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
                        "set modulation-arq 250Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
                        "set modulation-arq 250Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
                        "set modulation-arq 250Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
                        "set modulation-arq 250Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
                        "set modulation-arq 500Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
                        "set modulation-arq 500Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
                        "set modulation-arq 500Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
                        "set modulation-arq 500Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
                        "set modulation-arq 500Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
                        "set modulation-arq 750Mhz  qpsk1 cinr-low 11.5 cinr-high 16   backoff 7",
                        "set modulation-arq 750Mhz  qam16 cinr-low 17   cinr-high 127  backoff 9",
                        "set modulation-arq 750Mhz  bpsk1 cinr-low -128 cinr-high 12.5 backoff 7",
                        "set modulation-arq 1250Mhz qpsk1 cinr-low 12   cinr-high 16   backoff 7",
                        "set modulation-arq 1250Mhz bpsk1 cinr-low -128 cinr-high 13   backoff 7",
                        "",
                        "# Setup RF parameters",
                        "set rf mode adaptive",
                        eh2500Frequency,
                        eh2500TxPower,
                        "set rf lowest-modulation bpsk1",
                        "set rf long-range-mode normal",
                        "set rf atpc enable atpc-min-tx-power -35 atpc-target-rssi -35 atpc-min-cinr -128",
                        "",
                        "# Setup eth/VLAN parameters",
                        "set system bridge-mode transparent",
                        "set eth host network-type customer-uni classifier-mode pcp-dscp",
                        "set eth eth0 network-type customer-uni classifier-mode pcp-dscp",
                        "set eth eth1 network-type customer-uni classifier-mode pcp-dscp",
                        "set eth eth2 network-type customer-uni classifier-mode pcp-dscp",
                        "set eth eth3 network-type customer-uni classifier-mode pcp-dscp",
                        "set eth eth4 network-type customer-uni classifier-mode pcp-dscp",
                        "set bridge-common def-cvlan-etype 0x8100 out-of-quota flood mac-learning enable control-packets-cos disable",
                        "set bridge s1 vlan-ethertype 0x88a8",
                        "set bridge c1 vlan-ethertype 0x8100",
                        "set bridge c2 vlan-ethertype 0x8100",
                        "set bridge c3 vlan-ethertype 0x8100",
                        "set bridge c4 vlan-ethertype 0x8100",
                        "set bridge c5 vlan-ethertype 0x8100",
                        "set bridge c6 vlan-ethertype 0x8100",
                        "set vlan s1 1     egress c1,c2,c3,c4,c5,c6 untagged none    history disable",
                        "set vlan s1 undef egress c1,c2,c3,c4,c5,c6 untagged none    history disable",
                        "set vlan c1 1     egress host,s1           untagged host,s1 history disable",
                        "set vlan c1 2     egress host,s1           untagged none    history disable",
                        "set vlan c1 undef egress host,s1           untagged none    history disable",
                        "set vlan c2 1     egress eth0,s1           untagged none    history disable",
                        "set vlan c2 undef egress eth0,s1           untagged none    history disable",
                        "set vlan c3 1     egress eth1,s1           untagged none    history disable",
                        "set vlan c3 undef egress eth1,s1           untagged none    history disable",
                        "set vlan c4 1     egress eth2,s1           untagged eth2,s1 history disable",
                        "set vlan c4 2     egress eth2,s1           untagged none    history disable",
                        "set vlan c4 undef egress eth2,s1           untagged none    history disable",
                        "set vlan c5 1     egress eth3,s1           untagged none    history disable",
                        "set vlan c5 undef egress eth3,s1           untagged none    history disable",
                        "set vlan c6 1     egress eth4,s1           untagged none    history disable",
                        "set vlan c6 2     egress eth4,s1           untagged eth4    history disable",
                        "set vlan c6 undef egress eth4,s1           untagged none    history disable",
                        "set bridge-port c6 eth4 pvid 2",
                        "",
                        "# Setup IP parameters",
                        ipAddress,
                        gatewayAddress,
                        "",
                        "# Setup system parameters",
                        systemName,
                        password,
						snmp,
                        "set ntp 1 server 10.252.245.131",
                        "set ntp 1 secondary-server 10.252.245.163",
                        "set ntp 1 tmz -7",
                        "copy running-configuration startup-configuration",
		"### END ###"
	];

	var eh2500Configuration2 = [
		"### START ###",
				"# Setup modulation table",
				"set modulation 250Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
				"set modulation 250Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
				"set modulation 250Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
				"set modulation 250Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
				"set modulation 250Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
				"set modulation 500Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
				"set modulation 500Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
				"set modulation 500Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
				"set modulation 500Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
				"set modulation 500Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
				"set modulation 750Mhz  qpsk1 cinr-low 11.5 cinr-high 16   backoff 7",
				"set modulation 750Mhz  qam16 cinr-low 17   cinr-high 127  backoff 9",
				"set modulation 750Mhz  bpsk1 cinr-low -128 cinr-high 12.5 backoff 7",
				"set modulation 1250Mhz qpsk1 cinr-low 12   cinr-high 16   backoff 7",
				"set modulation 1250Mhz bpsk1 cinr-low -128 cinr-high 13   backoff 7",
				"set modulation-arq 250Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
				"set modulation-arq 250Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
				"set modulation-arq 250Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
				"set modulation-arq 250Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
				"set modulation-arq 250Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
				"set modulation-arq 500Mhz  qpsk1 cinr-low 12   cinr-high 21   backoff 7",
				"set modulation-arq 500Mhz  qam16 cinr-low 18   cinr-high 22.5 backoff 9",
				"set modulation-arq 500Mhz  qam32 cinr-low 21.5 cinr-high 127  backoff 9",
				"set modulation-arq 500Mhz  bpsk1 cinr-low -128 cinr-high 13   backoff 7",
				"set modulation-arq 500Mhz  bpsk2 cinr-low 9    cinr-high 16   backoff 7",
				"set modulation-arq 750Mhz  qpsk1 cinr-low 11.5 cinr-high 16   backoff 7",
				"set modulation-arq 750Mhz  qam16 cinr-low 17   cinr-high 127  backoff 9",
				"set modulation-arq 750Mhz  bpsk1 cinr-low -128 cinr-high 12.5 backoff 7",
				"set modulation-arq 1250Mhz qpsk1 cinr-low 12   cinr-high 16   backoff 7",
				"set modulation-arq 1250Mhz bpsk1 cinr-low -128 cinr-high 13   backoff 7",
				"",
				"# Setup RF parameters",
				"set rf mode adaptive",
				eh2500Frequency,
				eh2500TxPower,
				"set rf lowest-modulation bpsk1",
				"set rf long-range-mode normal",
				"set rf atpc enable atpc-min-tx-power -35 atpc-target-rssi -35 atpc-min-cinr -128",
				"",
				"# Setup eth/VLAN parameters",
				alias,
				"set system bridge-mode transparent",
				"set eth host network-type customer-uni classifier-mode pcp-dscp",
				"set eth eth0 network-type customer-uni classifier-mode pcp-dscp",
				"set eth eth1 network-type customer-uni classifier-mode pcp-dscp",
				"set eth eth2 network-type customer-uni classifier-mode pcp-dscp",
				"set eth eth3 network-type customer-uni classifier-mode pcp-dscp",
				"set eth eth4 network-type customer-uni classifier-mode pcp-dscp",
				"set bridge-common def-cvlan-etype 0x8100 out-of-quota flood mac-learning enable control-packets-cos disable",
				"set bridge s1 vlan-ethertype 0x88a8",
				"set bridge c1 vlan-ethertype 0x8100",
				"set bridge c2 vlan-ethertype 0x8100",
				"set bridge c3 vlan-ethertype 0x8100",
				"set bridge c4 vlan-ethertype 0x8100",
				"set bridge c5 vlan-ethertype 0x8100",
				"set bridge c6 vlan-ethertype 0x8100",
				vlans,
				"set bridge-port c6 eth4 pvid 2",
				"",
				"# Setup IP parameters",
				ipAddress,
				gatewayAddress,
				"",
				"# Setup system parameters",
				systemName,
				password,
				snmp,
				"set ntp 1 server 10.252.245.131",
				"set ntp 1 secondary-server 10.252.245.163",
				"set ntp 1 tmz -7",
				"copy running-configuration startup-configuration",
		"### END ###"
		];

	if(form.radioModel.value == "EH1200TL") {
                        document.getElementById("display").innerHTML = "";
                        document.getElementById("loader").style.display = "block";
                        setTimeout(function() {
                                    document.getElementById("display").innerHTML = eh1200Configuration.map(function(a) {
                                        return Array.isArray(a) ? a.join("<br />") : a;
                                    }).join("<br />");
                                    document.getElementById("loader").style.display = "none";
                        }, 500);
            } else if(form.radioModel.value == "EH2500FX") {
                        document.getElementById("display").innerHTML = "";
                        document.getElementById("loader").style.display = "block";
                        setTimeout(function() {
                                    document.getElementById("display").innerHTML = eh2500Configuration.map(function(a) {
                                        return Array.isArray(a) ? a.join("<br />") : a;
                                    }).join("<br />");
                                    document.getElementById("loader").style.display = "none";
                        }, 500);
            } else if(form.radioModel.value == "EH2500FX2") {
                        document.getElementById("display").innerHTML = "";
                        document.getElementById("loader").style.display = "block";
                        setTimeout(function() {
                                    document.getElementById("display").innerHTML = eh2500Configuration2.map(function(a) {
                                        return Array.isArray(a) ? a.join("<br />") : a;
                                    }).join("<br />");
                                    document.getElementById("loader").style.display = "none";
                        }, 500);
            } else {
                        alert("No radio model chosen!");
            }
}

function toggleAdvanced() {
	if (document.getElementById("advancedCheck").checked) {
		document.getElementById("advancedForm").style.display = "block";
	} else document.getElementById("advancedForm").style.display = "none";
}

function toggle2500Frequency(element) {
            var selectedValue = "freq" + element.options[element.selectedIndex].value;
            var freq250High = [
                        "82000",
                        "82250",
                        "82500",
                        "82750",
                        "83000",
                        "83250",
                        "83500",
                        "83750",
                        "84000",
                        "84250",
                        "84500",
                        "84750",
                        "85000",
                        "85250",
                        "85500",
                        "85750"
            ];
            var freq250Low = [
                        "72000",
                        "72250",
                        "72500",
                        "72750",
                        "73000",
                        "73250",
                        "73500",
                        "73750",
                        "74000",
                        "74250",
                        "74500",
                        "74750",
                        "75000",
                        "75250",
                        "75500",
                        "75750"
            ];
            var freq500High = [
                        "81875",
                        "82375",
                        "82875",
                        "83375",
                        "83875",
                        "84375",
                        "84875",
                        "85375"
            ];
            var freq500Low = [
                        "71875",
                        "72375",
                        "72875",
                        "73375",
                        "73875",
                        "74375",
                        "74875",
                        "75375"
            ];
            var freq750High = [
                        "81750",
                        "82250",
                        "83000",
                        "84000",
                        "84750",
                        "85500"
            ];
            var freq750Low = [
                        "71750",
                        "72250",
                        "73000",
                        "74000",
                        "74750",
                        "75500"
            ];
            var freq1250High = [
                        "81750",
                        "83000",
                        "84250"
            ];
            var freq1250Low = [
                        "71750",
                        "73000",
                        "74250"
            ];

            var optionTags = [];
            var selectedFrequency = eval(selectedValue);

            for(var i = 0; i != selectedFrequency.length; ++i) {
                        var tagLine = "<option value='" + selectedFrequency[i] + "'>" + selectedFrequency[i] + "</option>";
                        optionTags.push(tagLine);
            }

            document.getElementById("eh2500Frequency").innerHTML = optionTags.join();
}

function toggleRadio(element) {
            var selectedValue = element.options[element.selectedIndex].value;

            if(selectedValue == "EH1200TL") {
                        document.getElementById("form1200").style.display = "block";
                        document.getElementById("form2500").style.display = "none";
						document.getElementById("form2500-2").style.display = "none";
            } else if (selectedValue == "EH2500FX") {
                        document.getElementById("form1200").style.display = "none";
                        document.getElementById("form2500").style.display = "block";
						document.getElementById("form2500-2").style.display = "none";
            } else if (selectedValue == "EH2500FX2") {
                        document.getElementById("form1200").style.display = "none";
                        document.getElementById("form2500").style.display = "block";
						document.getElementById("form2500-2").style.display = "block";
            }
}
