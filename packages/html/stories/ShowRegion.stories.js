/**
 * Copyright (c) 2006-2013, JGraph Ltd
 *
 * Show region
 *
 * This example demonstrates using a custom
 * rubberband handler to show the selected region in a new window.
 */

import React from 'react';
import { globalTypes } from '../.storybook/preview';
import {
  constants,
  eventUtils,
  Graph,
  InternalEvent,
  MaxLog as domUtils,
  MaxPopupMenu,
  Rectangle,
  RubberBandHandler,
} from '@maxgraph/core';
import * as styleUtils from '@maxgraph/core/util/styleUtils';

const CSS_TEMPLATE = `
body div.mxPopupMenu {
  -webkit-box-shadow: 3px 3px 6px #C0C0C0;
  -moz-box-shadow: 3px 3px 6px #C0C0C0;
  box-shadow: 3px 3px 6px #C0C0C0;
  background: white;
  position: absolute;
  border: 3px solid #e7e7e7;
  padding: 3px;
}
body table.mxPopupMenu {
  border-collapse: collapse;
  margin: 0px;
}
body tr.mxPopupMenuItem {
  color: black;
  cursor: default;
}
body td.mxPopupMenuItem {
  padding: 6px 60px 6px 30px;
  font-family: Arial;
  font-size: 10pt;
}
body td.mxPopupMenuIcon {
  background-color: white;
  padding: 0px;
}
body tr.mxPopupMenuItemHover {
  background-color: #eeeeee;
  color: black;
}
table.mxPopupMenu hr {
  border-top: solid 1px #cccccc;
}
table.mxPopupMenu tr {
  font-size: 4pt;
}
`;

const HTML_TEMPLATE = `
<!-- Page passes the container for the graph to the program -->
<body onload="main(document.getElementById('graphContainer'))">

  <!-- Creates a container for the graph with a grid wallpaper -->
  <div id="graphContainer"
    style="overflow:hidden;width:321px;height:241px;background:url('editors/images/grid.gif');cursor:default;">
  </div>
  Use the right mouse button to select a region of the diagram and select <i>Show this</i>.
</body>
`;

export default {
  title: 'Misc/ShowRegion',
  argTypes: {
    ...globalTypes,
  },
};

const Template = ({ label, ...args }) => {
  const styleElm = document.createElement('style');
  styleElm.innerText = CSS_TEMPLATE;
  document.head.appendChild(styleElm);

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.width = `${args.width}px`;
  container.style.height = `${args.height}px`;
  container.style.background = 'url(/images/grid.gif)';
  container.style.cursor = 'default';

  // Disables built-in context menu
  InternalEvent.disableContextMenu(container);

  // Changes some default colors
  // TODO: Find a way of modifying globally or setting locally!
  //constants.HANDLE_FILLCOLOR = '#99ccff';
  //constants.HANDLE_STROKECOLOR = '#0088cf';
  //constants.VERTEX_SELECTION_COLOR = '#00a8ff';

  // Creates the graph inside the given container
  let graph = new Graph(container);

  class MyCustomRubberBandHandler extends RubberBandHandler {
    isForceRubberbandEvent(me) {
      return (
          RubberBandHandler.prototype.isForceRubberbandEvent.apply(this, arguments) ||
          me.isPopupTrigger()
      );
    };

    // Defines a new popup menu for region selection in the rubberband handler
    popupMenu = new MaxPopupMenu(function (menu, cell, evt) {
      let rect = new Rectangle(
          rubberband.x,
          rubberband.y,
          rubberband.width,
          rubberband.height
      );

      menu.addItem('Show this', null, function () {
        rubberband.popupMenu.hideMenu();
        let bounds = graph.getGraphBounds();
        domUtils.show(
            graph,
            null,
            bounds.x - rubberband.x,
            bounds.y - rubberband.y,
            rubberband.width,
            rubberband.height
        );
      });
    });

    mouseDown(sender, me) {
      this.popupMenu.hideMenu();
      super.mouseDown.apply(this, arguments);
    };

    mouseUp(sender, me) {
      if (eventUtils.isPopupTrigger(me.getEvent())) {
        if (!graph.getPlugin('PopupMenuHandler').isMenuShowing()) {
          let origin = styleUtils.getScrollOrigin();
          this.popupMenu.popup(
              me.getX() + origin.x + 1,
              me.getY() + origin.y + 1,
              null,
              me.getEvent()
          );
          this.reset();
        }
      } else {
        super.mouseUp.apply(this, arguments);
      }
    };
  }

  // Enables rubberband selection
  let rubberband = new MyCustomRubberBandHandler(graph);

  // Gets the default parent for inserting new cells. This
  // is normally the first child of the root (ie. layer 0).
  let parent = graph.getDefaultParent();

  // Adds cells to the model in a single step
  graph.batchUpdate(() => {
    let v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
    let v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
    let e1 = graph.insertEdge(parent, null, '', v1, v2);
  });
  return container;
};

export const Default = Template.bind({});
