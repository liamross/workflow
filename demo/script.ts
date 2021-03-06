// tslint:disable:no-console

import {
  // Paper
  Paper,
  IPaperProperties,
  IPaperInputNode,

  // Nodes
  BaseNode,
  Rectangle,
  IRectangleProperties,

  // Edges
  BaseEdge,
  Line,
  ILineProperties,
  TextLine,
  ITextLineProperties,

  // Other
  PaperError,
  PaperEvent,
  PaperEventType,
} from 'psiagram';

import { Grid } from 'psiagram-plugin-grid';
import { MouseEvents } from 'psiagram-plugin-mouse-events';
import { ManhattanRouting } from 'psiagram-plugin-routing';

let myPaper: Paper | null = null;

/**
 * Initialize myPaper and mount Paper into html.
 */
function loadPaper() {
  const paperProperties: IPaperProperties = {
    attributes: { gridSize: 20 },
    height: 900,
    width: 1300,
    plugins: [new Grid(), new MouseEvents(), new ManhattanRouting()],
    initialConditions: {
      nodes: [
        {
          id: 'node1',
          component: 'rectangle',
          coords: { x: 60, y: 260 },
          properties: {
            width: 112,
            height: 85,
            title: 'node 1',
          } as IRectangleProperties,
        },
        {
          id: 'node2',
          component: 'rectangle',
          coords: { x: 400, y: 220 },
          properties: {
            width: 130,
            height: 140,
            title: 'node 2',
          } as IRectangleProperties,
        },
        {
          id: 'node3',
          component: 'rectangle',
          coords: { x: 400, y: 600 },
          properties: {
            width: 100,
            height: 100,
            title: 'node 3',
          } as IRectangleProperties,
        },
      ],
      nodeComponentMap: {
        rectangle: Rectangle as typeof BaseNode,
      },
      edges: [
        {
          id: 'edge1',
          component: 'line',
          source: { x: 120, y: 120 },
          target: { id: 'node1' },
          coords: [],
          properties: { strokeColor: 'green' } as ILineProperties,
        },
        {
          id: 'edge2',
          component: 'text-line',
          source: { id: 'node1' },
          target: { id: 'node2' },
          coords: [],
          properties: {
            title: 'Edge 2',
            strokeColor: 'blue',
          } as ITextLineProperties,
        },
        {
          id: 'edge3',
          component: 'line',
          source: { id: 'node2' },
          target: { id: 'node3' },
          coords: [],
          properties: { strokeWidth: 4 } as ILineProperties,
        },
        {
          id: 'edge4',
          component: 'text-line',
          source: { id: 'node3' },
          target: { x: 800, y: 800 },
          properties: { title: 'Edge 4' } as ITextLineProperties,
          coords: [],
        },
      ],
      edgeComponentMap: {
        line: Line as typeof BaseEdge,
        'text-line': TextLine as typeof BaseEdge,
      },
    },
  };

  myPaper = new Paper(paperProperties);

  addListeners();

  // Append paper into div #_target
  const target = document.getElementById('_target');
  target.appendChild(myPaper.getPaperElement());
}

/**
 * Add new_node_test to the Paper if not already added.
 */
function addNode() {
  if (myPaper) {
    const node: IPaperInputNode = {
      component: 'rectangle',
      coords: {
        x: 320,
        y: 160,
      },
      id: `new_node_test`,
      properties: {
        height: 60,
        title: 'Title 1',
        width: 160,
      } as IRectangleProperties,
    };

    try {
      myPaper.addNode(node);
    } catch (err) {
      const error = err as PaperError;
      console.error(error.toString());
    }
  }
}

/**
 * Move new_node_test to 0,0 on the Paper if it exists.
 */
function moveNode() {
  if (myPaper) {
    try {
      const nodeInstance = myPaper.getNode('new_node_test');
      nodeInstance.coords = { x: 0, y: 0 };
    } catch (err) {
      const error = err as PaperError;
      console.error(error.toString());
    }
  }
}

/**
 * Remove new_node_test from Paper if it exists.
 */
function removeNode() {
  if (myPaper) {
    try {
      myPaper.removeNode('new_node_test');
    } catch (err) {
      const error = err as PaperError;
      console.error(error.toString());
    }
  }
}

/**
 * Add listeners to myPaper if it is initialized.
 */
function addListeners() {
  if (myPaper) {
    function eventListener(evt: PaperEvent<any>) {
      console.log({
        EVENT: evt.eventType
          .replace(/-/g, ' ')
          .replace(/^\w/, c => c.toUpperCase()),
        PROPERTIES: {
          data: evt.data,
          eventType: evt.eventType,
          paper: evt.paper,
          target: evt.target,
        },
        METHODS: {
          defaultAction: evt.defaultAction,
          preventDefault: evt.preventDefault,
          stopPropagation: evt.stopPropagation,
        },
      });
    }

    // ENABLE LISTENERS AS NEEDED.

    myPaper.addListener(PaperEventType.AddNode, eventListener);
    myPaper.addListener(PaperEventType.MoveNode, eventListener);
    myPaper.addListener(PaperEventType.RemoveNode, eventListener);

    myPaper.addListener(PaperEventType.AddEdge, eventListener);
    myPaper.addListener(PaperEventType.MoveEdge, eventListener);
    myPaper.addListener(PaperEventType.RemoveEdge, eventListener);

    myPaper.addListener(PaperEventType.UpdateActiveItem, eventListener);
  }
}

document.getElementById('_addNodeButton').addEventListener('click', addNode);
document.getElementById('_moveNodeButton').addEventListener('click', moveNode);
document
  .getElementById('_removeNodeButton')
  .addEventListener('click', removeNode);

// Load paper element once DOM is loaded.
document.addEventListener('DOMContentLoaded', () => loadPaper());
