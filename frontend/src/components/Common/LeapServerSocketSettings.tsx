import React from "react";
import { useAppSelector, useAppDispatch } from '../../hooks/general'
import { getLeapServer, setLeapServerAddress } from "../../slices/leapServerSlice";
import { LeapSocketClient } from "../../socket/LeapSocketClient";

function LeapServerSocketSettings(): JSX.Element {
	const { address, connected } = useAppSelector((state) => getLeapServer(state));
	const dispatch = useAppDispatch();

	const handleServerAddressInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
		dispatch(setLeapServerAddress(event.target.value));
	};

	return (
		<div className="w3-container">
			<div className="w3-row">
				<div className="w3-col s12">
					<h2>Leap Server Socket Settings</h2>
				</div>
			</div>
			<div className="w3-row">
				<div className="w3-col s6">
					<form className="w3-container" noValidate autoComplete="off">
						<input className="w3-input w3-border w3-round" type="text" id="outlined-basic" placeholder="Leap server address" value={address} onChange={handleServerAddressInputChange} />
					</form>
				</div>
				<div className="w3-col s2">
					{connected ?
						<button className="w3-button w3-red w3-round" onClick={() => LeapSocketClient.disconnectFromServer()}>Disconnect</button>
						:
						<button className="w3-button w3-blue w3-round" onClick={() => LeapSocketClient.connectToServer()}>Connect</button>
					}
				</div>
				<div className="w3-col s4"></div>
			</div>
		</div>
	);
}

export default LeapServerSocketSettings;
