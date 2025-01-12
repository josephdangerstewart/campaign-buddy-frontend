import Color from 'color';
import { ThemeColor } from '../types';
import { activeMask, gray, hoverMask } from './sharedColors';

export function hover(baseColor: ThemeColor): ThemeColor {
	return Color(baseColor).mix(Color(hoverMask)).rgb().toString();
}

export function active(baseColor: ThemeColor): ThemeColor {
	return Color(baseColor).mix(Color(activeMask)).rgb().toString();
}

export function disable(baseColor: ThemeColor): ThemeColor {
	return Color(baseColor).mix(Color(gray)).rgb().toString();
}
