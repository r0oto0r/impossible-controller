import { setTrackingData } from '../../slices/leapTrackingSlice';
import store from '../../store/store';
import { LeapTrackingData } from '../../common/LeapInterfaces';

export default class LeapTrackingHandler {
	public static processTrackingData = (trackingData: LeapTrackingData) => {
		store.dispatch(setTrackingData(trackingData));
	}
}
