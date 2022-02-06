import React from 'react';
import {
	Input,
	AggregatedTextInput,
	AggregatedDisplayText,
	FormGroup,
} from '@campaign-buddy/core-ui';
import { WidgetProps } from '@campaign-buddy/form-generator';

export const StringWidget: React.FC<WidgetProps<string>> = ({
	value,
	aggregatedValue,
	hasAggregation,
	onChange,
	isEditable,
	label,
}) => {
	if (hasAggregation && !isEditable) {
		return (
			<FormGroup label={label}>
				<AggregatedDisplayText>{aggregatedValue ?? ''}</AggregatedDisplayText>
			</FormGroup>
		);
	}

	if (hasAggregation) {
		return (
			<AggregatedTextInput
				value={value ?? ''}
				aggregatedDisplayValue={aggregatedValue ?? ''}
				onChange={onChange}
				label={label}
			/>
		);
	}

	return (
		<Input
			value={value ?? ''}
			onChange={onChange}
			label={label}
			disabled={!isEditable}
		/>
	);
};
