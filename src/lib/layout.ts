import dagre from 'dagre';
import { Edge, Node } from '@xyflow/react';
import {
  compareHierarchyCodes,
  getHierarchyDepth,
  getParentHierarchyCandidates,
} from './hierarchy';

type LayoutNode = Node & {
  children: LayoutNode[];
};

const ROOT_SIZE = { width: 280, height: 92 };
const MAJOR_SIZE = { width: 240, height: 78 };
const CATEGORY_SIZE = { width: 214, height: 68 };
const DETAIL_SIZE = { width: 190, height: 62 };

// Keep enough room for the widest card at each level. The previous offsets
// were smaller than the rendered cards and made large maps look like a wall.
const LEVEL_X = [0, 420, 760, 1070, 1360, 1630];

function getNumberCode(node: Node): string {
  return String((node.data as any).numberCode || '').trim();
}

function compareByNumberCode(a: Node, b: Node): number {
  const hierarchyDelta = compareHierarchyCodes(getNumberCode(a), getNumberCode(b));
  if (hierarchyDelta !== 0) return hierarchyDelta;

  const labelA = String((a.data as any).label || a.id);
  const labelB = String((b.data as any).label || b.id);
  return labelA.localeCompare(labelB, undefined, { numeric: true, sensitivity: 'base' });
}

function getHierarchyDepthFromCode(code: string): number {
  return getHierarchyDepth(code);
}

function getParentCodeCandidates(code: string): string[] {
  return getParentHierarchyCandidates(code);
}

function getNodeSize(node: Node): { width: number; height: number } {
  const code = getNumberCode(node);
  const depth = getHierarchyDepthFromCode(code);
  const label = String((node.data as any).label || '');
  const nodeType = String((node.data as any).nodeType || '').toLowerCase();
  const isRoot = nodeType === 'root' || code === '1.0';

  let base = isRoot ? ROOT_SIZE : depth <= 1 ? MAJOR_SIZE : depth === 2 ? CATEGORY_SIZE : DETAIL_SIZE;

  const longLabelBoost = Math.min(44, Math.max(0, Math.floor(Math.max(0, label.length - 24) / 8) * 6));
  const lineBoost = label.length > 42 ? 10 : 0;
  const heightBoost = label.length > 60 ? 12 : 0;

  return {
    width: base.width + longLabelBoost,
    height: base.height + lineBoost + heightBoost,
  };
}

function getXForDepth(depth: number): number {
  if (depth <= 0) return LEVEL_X[0];
  if (depth < LEVEL_X.length) return LEVEL_X[depth];
  return LEVEL_X[LEVEL_X.length - 1] + (depth - (LEVEL_X.length - 1)) * 150;
}

function getVerticalGap(depth: number): number {
  if (depth <= 1) return 56;
  if (depth === 2) return 34;
  if (depth === 3) return 24;
  return 18;
}

function buildTreeFromHierarchy(nodes: Node[], edges: Edge[]) {
  const nodeMap = new Map<string, LayoutNode>();
  const codeIndex = new Map<string, string[]>();
  const incomingSources = new Map<string, string[]>();

  nodes.forEach((node) => {
    const cloned = { ...node, children: [] } as LayoutNode;
    nodeMap.set(node.id, cloned);

    const code = getNumberCode(node);
    if (code) {
      const list = codeIndex.get(code) || [];
      list.push(node.id);
      codeIndex.set(code, list);
    }
  });

  edges.forEach((edge) => {
    const list = incomingSources.get(edge.target) || [];
    list.push(edge.source);
    incomingSources.set(edge.target, list);
  });

  const rootCandidates = [...nodes]
    .filter((node) => {
      const code = getNumberCode(node);
      const nodeType = String((node.data as any).nodeType || '').toLowerCase();
      return node.id === 'root' || nodeType === 'root' || code === '1.0';
    })
    .sort(compareByNumberCode);

  const primaryRootId = rootCandidates[0]?.id || nodes[0]?.id;
  const rootNode = primaryRootId ? nodeMap.get(primaryRootId) : undefined;

  if (!rootNode) {
    return { rootNodes: [], nodeMap };
  }

  const parentById = new Map<string, string | null>();
  const attach = (childId: string, parentId: string | null) => {
    if (!parentId || childId === parentId) return;
    parentById.set(childId, parentId);
  };

  nodes.forEach((node) => {
    if (node.id === rootNode.id) return;

    const code = getNumberCode(node);
    const candidates = getParentCodeCandidates(code);
    let resolvedParent: string | null = null;

    for (const candidate of candidates) {
      const candidateIds = codeIndex.get(candidate);
      if (candidateIds?.length) {
        resolvedParent = candidateIds[0];
        break;
      }
    }

    if (!resolvedParent) {
      const sources = incomingSources.get(node.id) || [];
      const sortedSources = sources
        .filter((sourceId) => sourceId !== node.id && nodeMap.has(sourceId))
        .sort((a, b) => compareByNumberCode(nodeMap.get(a)!, nodeMap.get(b)!));
      resolvedParent = sortedSources[0] || rootNode.id;
    }

    attach(node.id, resolvedParent);
  });

  parentById.forEach((parentId, childId) => {
    const parent = nodeMap.get(parentId);
    const child = nodeMap.get(childId);
    if (!parent || !child) return;
    parent.children.push(child);
  });

  // Attach any unparented nodes to the root são nothing gets lost visually.
  nodes.forEach((node) => {
    if (node.id === rootNode.id) return;
    if (!parentById.has(node.id)) {
      const child = nodeMap.get(node.id);
      if (child) rootNode.children.push(child);
    }
  });

  const sortTree = (node: LayoutNode) => {
    node.children.sort(compareByNumberCode);
    node.children.forEach(sortTree);
  };

  sortTree(rootNode);

  return { rootNodes: [rootNode], nodeMap };
}

function layoutHierarchy(nodes: Node[], edges: Edge[]) {
  const { rootNodes } = buildTreeFromHierarchy(nodes, edges);
  if (!rootNodes.length) return { nodes, edges };

  const positioned = new Map<string, { x: number; y: number }>();
  const sizeCache = new Map<string, { width: number; height: number }>();
  const heightCache = new Map<string, number>();
  const widthCache = new Map<string, number>();

  const getSize = (node: LayoutNode) => {
    const cached = sizeCache.get(node.id);
    if (cached) return cached;
    const size = getNodeSize(node);
    sizeCache.set(node.id, size);
    return size;
  };

  const getSubtreeHeight = (node: LayoutNode, depth: number): number => {
    const cacheKey = `${node.id}:${depth}`;
    const cached = heightCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const { height } = getSize(node);
    if (!node.children.length) {
      heightCache.set(cacheKey, height);
      return height;
    }

    const gap = getVerticalGap(depth + 1);
    const childrenHeight = node.children.reduce((sum, child, index) => {
      const childHeight = getSubtreeHeight(child, depth + 1);
      return sum + childHeight + (index > 0 ? gap : 0);
    }, 0);

    const totalHeight = Math.max(height, childrenHeight);
    heightCache.set(cacheKey, totalHeight);
    return totalHeight;
  };

  const getSubtreeWidth = (node: LayoutNode, depth: number): number => {
    const cacheKey = `${node.id}:${depth}`;
    const cached = widthCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const { width } = getSize(node);
    if (!node.children.length) {
      widthCache.set(cacheKey, width);
      return width;
    }

    const totalWidth = Math.max(
      width,
      node.children.reduce((sum, child, index) => {
        const childWidth = getSubtreeWidth(child, depth + 1);
        return sum + childWidth + (index > 0 ? 22 : 0);
      }, 0)
    );

    widthCache.set(cacheKey, totalWidth);
    return totalWidth;
  };

  const positionNode = (node: LayoutNode, depth: number, topY: number) => {
    const { width, height } = getSize(node);
    const subtreeHeight = getSubtreeHeight(node, depth);
    const subtreeWidth = getSubtreeWidth(node, depth);
    const x = getXForDepth(depth);

    if (!node.children.length) {
      positioned.set(node.id, {
        x,
        y: topY + Math.max(0, subtreeHeight - height) / 2,
      });
      return { height: subtreeHeight, centerY: topY + subtreeHeight / 2, width: subtreeWidth };
    }

    const gap = getVerticalGap(depth + 1);
    const childHeights = node.children.map((child) => getSubtreeHeight(child, depth + 1));
    const totalChildHeight = childHeights.reduce((sum, value) => sum + value, 0) + gap * Math.max(0, node.children.length - 1);
    const childStartY = topY + Math.max(0, (subtreeHeight - totalChildHeight) / 2);

    let cursorY = childStartY;
    let firstCenter: number | null = null;
    let lastCenter: number | null = null;

    node.children.forEach((child, index) => {
      const childHeight = childHeights[index];
      const childResult = positionNode(child, depth + 1, cursorY);
      const childCenter = childResult.centerY;

      if (firstCenter === null) firstCenter = childCenter;
      lastCenter = childCenter;

      cursorY += childHeight + gap;
    });

    const centerY = firstCenter !== null && lastCenter !== null ?
       (firstCenter + lastCenter) / 2
      : topY + subtreeHeight / 2;

    positioned.set(node.id, {
      x,
      y: centerY - height / 2,
    });

    return { height: subtreeHeight, centerY, width: subtreeWidth };
  };

  let currentTop = 0;
  rootNodes.forEach((rootNode, index) => {
    if (index > 0) currentTop += 80;
    const result = positionNode(rootNode, 0, currentTop);
    currentTop += result.height;
  });

  const positionedNodes = nodes.map((node) => {
    const pos = positioned.get(node.id) || { x: 0, y: 0 };
    return {
      ...node,
      position: {
        x: Math.round(pos.x),
        y: Math.round(pos.y),
      },
    };
  });

  const minX = Math.min(...positionedNodes.map((node) => node.position.x));
  const minY = Math.min(...positionedNodes.map((node) => node.position.y));
  const offsetX = 80 - Math.min(0, minX);
  const offsetY = 80 - Math.min(0, minY);

  return {
    nodes: positionedNodes.map((node) => ({
      ...node,
      position: {
        x: Math.round(node.position.x + offsetX),
        y: Math.round(node.position.y + offsetY),
      },
    })),
    edges,
  };
}

function getDagreLayout(nodes: Node[], edges: Edge[], direction = 'LR') {
  const dagreGraph = new dagre.graphlib.Graph({ compound: false });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: direction === 'LR' || direction === 'RL' ? 72 : 110,
    ranksep: direction === 'LR' || direction === 'RL' ? 210 : 150,
    edgesep: 36,
    ranker: 'network-simplex',
    marginx: 60,
    marginy: 60,
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeSize(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 };
    const { width, height } = getNodeSize(node);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  const minX = Math.min(...positionedNodes.map((node) => node.position.x));
  const minY = Math.min(...positionedNodes.map((node) => node.position.y));

  return {
    nodes: positionedNodes.map((node) => ({
      ...node,
      position: {
        x: Math.round(node.position.x - minX + 80),
        y: Math.round(node.position.y - minY + 80),
      },
    })),
    edges,
  };
}

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'RL' | 'TB' | 'BT' | 'TD' | 'hierarchical' = 'hierarchical'
) => {
  if (direction === 'hierarchical' || direction === 'LR') {
    return layoutHierarchy(nodes, edges);
  }

  return getDagreLayout(nodes, edges, direction === 'TD' ? 'TB' : direction);
};
