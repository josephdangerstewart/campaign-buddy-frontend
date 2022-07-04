import React, { useCallback, useEffect, useMemo } from 'react';
import { OverflowedItemsProps } from '@campaign-buddy/overflow';
import {
	ToggleButton,
	MenuPopover,
	Button,
	MenuItem,
} from '@campaign-buddy/core-ui';
import { PaneTabItem } from './PaneTab';
import {
	CloseButtonContainer,
	DropDownButtonContainer,
	MenuItemContainer,
} from './TabOverflowMenu.styled';
import { useObserverState } from '../useObservedState';
import { useBooleanState, useCombinedRefs } from '@campaign-buddy/common-hooks';
import { MenuItemRenderApi } from '@campaign-buddy/core-ui/src/menu/Menu';
import {
	coordinateTransformers,
	isPaneDragItem,
	PaneDragItemKind,
	usePaneDrag,
	useSectionedDropZone,
} from '../drag-and-drop';

export function TabOverflowMenu({ items }: OverflowedItemsProps<PaneTabItem>) {
	const hasActivePane = useMemo(() => items.some((x) => x.isActive), [items]);
	const [isMenuOpen, openMenu, closeMenu] = useBooleanState(false);

	useEffect(() => {
		if (items.length === 0) {
			closeMenu();
		}
	}, [closeMenu, items.length]);

	// Title is filled in by custom menu item render
	// so no need to add it here
	const menuItems = useMemo<MenuItem<PaneTabItem>[]>(
		() =>
			items.map<MenuItem<PaneTabItem>>((item) => ({
				itemData: item,
			})),
		[items]
	);

	const renderMenuItem = useCallback(
		(api: MenuItemRenderApi<PaneTabItem>) => <OverflowMenuItem {...api} />,
		[]
	);

	if (items.length === 0) {
		return null;
	}

	return (
		<DropDownButtonContainer>
			<MenuPopover
				isOpen={isMenuOpen}
				onClose={closeMenu}
				items={menuItems}
				renderMenuItem={renderMenuItem}
			>
				<ToggleButton
					value={hasActivePane}
					onChange={openMenu}
					icon="chevron-down"
					size="small"
				/>
			</MenuPopover>
		</DropDownButtonContainer>
	);
}

function OverflowMenuItem({ item, MenuItem }: MenuItemRenderApi<PaneTabItem>) {
	const tabItem = item.itemData;
	if (!tabItem) {
		throw new Error('itemData is required');
	}
	const { pane } = tabItem;

	const { dragRef } = usePaneDrag(pane);

	const { dropRef, hoveringLocation } = useSectionedDropZone(
		PaneDragItemKind,
		coordinateTransformers.splitHorizontally,
		(location, dropData) => {
			if (!isPaneDragItem(dropData)) {
				return;
			}

			const beforeTab = location === 'top' ? pane : pane.getSibling('after');
			pane.getParent()?.addToTabBarFromDrop(dropData, beforeTab?.getId());
		}
	);

	const dndRef = useCombinedRefs(dragRef, dropRef);
	const title = useObserverState(tabItem.pane, tabItem.pane.getTabTitle);

	const transformedItem = useMemo<MenuItem<PaneTabItem>>(
		() => ({
			displayText: title,
			renderRightElement: () => (
				<CloseButtonContainer>
					<Button
						icon="cross"
						size="small"
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							tabItem.pane.close();
						}}
						style="minimal"
					/>
				</CloseButtonContainer>
			),
			onClick: () => tabItem.onActivePaneIdChange(tabItem.pane.getId()),
		}),
		[tabItem, title]
	);

	return (
		<MenuItemContainer hoveringSide={hoveringLocation} ref={dndRef}>
			<MenuItem verticalPadding={0} item={transformedItem} />
		</MenuItemContainer>
	);
}