import { useAppDispatch, useAppSelector } from '../../hooks/general';
import { getCommuniQi, setTwitchChannelName, setYouTubeLiveId } from '../../slices/communiQiSlice';
import { getServer } from '../../slices/serverSlice';

function CommuniQiSettings(): JSX.Element {
	const { address } = useAppSelector((state) => getServer(state));
	const { started, twitchChannelName, youtubeLiveId } = useAppSelector((state) => getCommuniQi(state));
	const dispatch = useAppDispatch();

	const handleTwitchChannelNameInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
		dispatch(setTwitchChannelName(event.target.value));
	};

	const handleYouTubeLiveIdInputChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
		dispatch(setYouTubeLiveId(event.target.value));
	};

	const toggleStatus = () => {
		if(!started) {
			fetch(`${address}/communi-qi/start`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					twitchChannelName,
					youtubeLiveId
				})
			});
		} else {
			fetch(`${address}/communi-qi/stop`, {
				method: 'POST'
			});
		}
	};

	return (
		<div className="w3-container">
			<div className="w3-row">
				<div className="w3-col s12">
					<h2>CommuniQi Settings</h2>
				</div>
			</div>
			<div className="w3-row">
				<div className="w3-col s5">
					<form className="w3-container" noValidate autoComplete="off">
						<input className="w3-input w3-border w3-round" type="text" id="outlined-basic" placeholder="Twitch channel name" value={twitchChannelName} onChange={handleTwitchChannelNameInputChange} />
					</form>
				</div>
				<div className="w3-col s5">
					<form className="w3-container" noValidate autoComplete="off">
						<input className="w3-input w3-border w3-round" type="text" id="outlined-basic" placeholder="YouTube live id" value={youtubeLiveId} onChange={handleYouTubeLiveIdInputChange} />
					</form>
				</div>
				<div className="w3-col s2">
					<button className={`w3-button w3-round ${started ? 'w3-green' : 'w3-blue'}`} onClick={toggleStatus}>
						{started ? 'Stop' : 'Start'}
					</button>
				</div>
			</div>
		</div>
	);
}

export default CommuniQiSettings;
