import Color from 'color';

export type ThemeColor = string;

interface IBorderRadius {
	topLeft?: number;
	topRight?: number;
	bottomRight?: number;
	bottomLeft?: number;
}

export class BorderRadius {
	private radius: IBorderRadius;

	constructor(radius: number | IBorderRadius) {
		if (typeof radius === 'number') {
			this.radius = {
				topLeft: radius,
				topRight: radius,
				bottomRight: radius,
				bottomLeft: radius,
			};
		} else {
			this.radius = radius;
		}
	}

	public get topLeft() {
		return this.radius.topLeft ?? 0;
	}

	public get topRight() {
		return this.radius.topRight ?? 0;
	}

	public get bottomRight() {
		return this.radius.bottomRight ?? 0;
	}

	public get bottomLeft() {
		return this.radius.bottomLeft ?? 0;
	}

	public toCss = () => {
		return `${this.radius?.topLeft ?? 0}px ${this.radius?.topRight ?? 0}px ${
			this.radius?.bottomRight ?? 0
		}px ${this.radius?.bottomLeft ?? 0}px`;
	};
}

interface IThickness {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export class Thickness {
	private thickness: IThickness;

	constructor(value: number | string | IThickness) {
		if (typeof value === 'string') {
			this.thickness = this.parseThickness(value);
		} else if (typeof value === 'number') {
			this.thickness = {
				top: value,
				right: value,
				bottom: value,
				left: value,
			};
		} else {
			this.thickness = value;
		}
	}

	public get top() {
		return this.thickness.top;
	}

	public get bottom() {
		return this.thickness.bottom;
	}

	public get left() {
		return this.thickness.left;
	}

	public get right() {
		return this.thickness.right;
	}

	public get vertical() {
		return this.thickness.top + this.thickness.bottom;
	}

	public get horizontal() {
		return this.thickness.right + this.thickness.left;
	}

	public toCss(): string {
		return `${this.thickness.top}px ${this.thickness.right}px ${this.thickness.bottom}px ${this.thickness.left}px`;
	}

	private parseThickness(value: string): IThickness {
		const splitValue = value.split(' ').filter((x) => x);
		const topRaw = splitValue[0] ?? '0';
		const rightRaw = splitValue[1] ?? topRaw;
		const bottomRaw = splitValue[2] ?? topRaw;
		const leftRaw = splitValue[3] ?? rightRaw;

		const parsed = [topRaw, rightRaw, bottomRaw, leftRaw].map((x) =>
			parseInt(x)
		);
		if (parsed.some(isNaN)) {
			return { top: 0, bottom: 0, left: 0, right: 0 };
		}

		return {
			top: parsed[0],
			right: parsed[1],
			bottom: parsed[2],
			left: parsed[3],
		};
	}
}

export interface IDropShadow {
	xOffset: number;
	yOffset: number;
	blurRadius: number;
	spreadRadius: number;
	inset: boolean;
	color: ThemeColor | undefined;
}

export class DropShadow {
	private shadows: IDropShadow[];

	constructor(shadow: IDropShadow | IDropShadow[] | string[]) {
		if (Array.isArray(shadow) && typeof shadow[0] === 'object') {
			this.shadows = shadow as IDropShadow[];
		} else if (Array.isArray(shadow)) {
			this.shadows = (shadow as string[]).map((shadow) =>
				this.parseDropShadow(shadow)
			);
		} else {
			this.shadows = [shadow];
		}
	}

	public toCss = (): string => {
		return this.shadows
			.map(
				({ xOffset, yOffset, blurRadius, spreadRadius, inset, color }) =>
					`${
						inset ? 'inset ' : ''
					}${xOffset}px ${yOffset}px ${blurRadius}px ${spreadRadius}px${
						color ? ` ${color}` : ''
					}`
			)
			.join(', ');
	};

	public withTransformedColor = (
		transformer: (color: ThemeColor) => ThemeColor
	): DropShadow => {
		return new DropShadow(
			this.shadows.map((shadow) => ({
				...shadow,
				color: shadow.color && transformer(shadow.color),
			}))
		);
	};

	private parseDropShadow = (shadowString: string): IDropShadow => {
		const [wholeMatch, insetMatch, numbersMatch, colorMatch] =
			this.dropShadowRegex.exec(shadowString.trim()) ?? [];

		if (!wholeMatch) {
			throw new Error(`"${shadowString}" is not a valid box-shadow`);
		}

		const [xOffset, yOffset, blurRadius = 0, spreadRadius = 0] = numbersMatch
			.split(/\s+/)
			.map((match) => {
				const rawNumber = match.replaceAll('px', '').trim();

				const number = parseFloat(rawNumber);

				if (isNaN(number)) {
					throw new Error(`${match} is not a valid value in "${shadowString}"`);
				}

				return number;
			});

		let color: ThemeColor | undefined;
		try {
			color = colorMatch && Color(colorMatch.trim()).rgb().toString();
		} catch {
			throw new Error(`could not parse ${colorMatch} in "${shadowString}"`);
		}

		console.log(yOffset);

		return {
			inset: Boolean(insetMatch),
			xOffset,
			yOffset,
			blurRadius,
			spreadRadius,
			color,
		};
	};

	private get dropShadowRegex() {
		return /^\s*(inset)?\s*((?:-?\s*\d+(?:\.\d)?(?:px)?\s*){2,4})(\s+(?:#(?:[\dA-Fa-f]{3}){1,2}(?:[\dA-Fa-f]{2})?|rgba?\s*\(.+\)|hsl\s*\(.+\)|[a-zA-Z]+))?$/;
	}
}
