import cuid from 'cuid';
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
	PanelLayout,
	PanelLayoutDto,
	PanelLayoutModel,
	PanelModel,
} from '../src';
import { CustomDragLayer } from './CustomDragLayer';

export default {
	title: 'panel-layout/PanelLayout',
};

const GlobalStyle = createGlobalStyle`
	html, body, #root {
		width: 100%;
		height: 100%;
		padding: 0;
	}
`;

const StoryRoot = styled.div`
	height: 100%;
	padding: 8px;
	position: relative;
`;

const layoutDto: PanelLayoutDto = {
	kind: 'panelLayout',
	children: [
		{
			kind: 'panelRow',
			children: [
				{
					kind: 'panel',
					children: [
						{
							kind: 'pane',
							location: 'characterSheet:characterId=1234&foo=bar',
						},
					],
				},
				{
					kind: 'panel',
					children: [
						{
							kind: 'pane',
							location: 'notesTool:noteId=12345',
						},
					],
				},
			],
			sizes: [50, 50],
		},
		{
			kind: 'panelRow',
			children: [
				{
					kind: 'panel',
					children: [
						{
							kind: 'pane',
							location: 'characterSheet',
						},
					],
				},
				{
					kind: 'panelLayout',
					children: [
						{
							kind: 'panelRow',
							children: [
								{
									kind: 'panel',
									children: [
										{
											kind: 'pane',
											location: 'somelocation',
										},
									],
								},
							],
							sizes: [100],
						},
						{
							kind: 'panelRow',
							children: [
								{
									kind: 'panel',
									children: [
										{
											kind: 'pane',
											location: 'someotherlocation',
										},
									],
								},
							],
							sizes: [100],
						},
						{
							kind: 'panelRow',
							children: [
								{
									kind: 'panel',
									children: [
										{
											kind: 'pane',
											location: 'someotherlocation',
										},
									],
								},
							],
							sizes: [100],
						},
					],
					sizes: [25, 25, 50],
				},
			],
			sizes: [50, 50],
		},
	],
	sizes: [35, 65],
};

const layout = new PanelLayoutModel(layoutDto);

function addNewPane() {
	const firstPanel = layout.getChildren()[0].getChildren()[0];

	if (firstPanel instanceof PanelModel) {
		firstPanel.addPane({ location: cuid(), kind: 'pane' });
	}
}

function addNewPanel() {
	const firstRow = layout.getChildren()[0];

	firstRow.addPanel({
		kind: 'panel',
		children: [{ kind: 'pane', location: cuid() }],
	});
}

function serialize() {
	console.log(layout.toJson());
}

export const Primary = () => {
	return (
		<StoryRoot>
			<DndProvider backend={HTML5Backend}>
				<GlobalStyle />
				<button onClick={addNewPane}>Add pane</button>
				<button onClick={addNewPanel}>Add panel</button>
				<button onClick={serialize}>Serialize</button>
				<PanelLayout panelLayout={layout} />
				<CustomDragLayer />
			</DndProvider>
		</StoryRoot>
	);
};
Primary.parameters = {
	backgrounds: { default: 'campaign-buddy-app' },
};