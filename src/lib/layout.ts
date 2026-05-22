import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 80;

// Extract hierarchy level from numberCode (e.g., '1.0' -> 0, '2.1' -> 1, '2.1.1' -> 2)
function getLevelFromNumberCode(code: string | undefined): number {
  if (!code) return 0;
  const parts = code.split('.');
  return Math.max(0, parts.length - 1);
}

// Build hierarchy using numberCode for better ordering
function buildHierarchyByNumberCode(nodes: Node[], edges: Edge[]) {
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [] }]));
  
  // Build parent-child relationships from edges
  edges.forEach(edge => {
    const parent = nodeMap.get(edge.source);
    const child = nodeMap.get(edge.target);
    if (parent && child) {
      parent.children.push(child);
    }
  });
  
  // Find root nodes (no incoming edges)
  const targetIds = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targetIds.has(n.id)).map(n => nodeMap.get(n.id)!);
  
  // Sort children by numberCode to maintain sequence
  function sortChildren(node: any) {
    if (node.children) {
      node.children.sort((a: any, b: any) => {
        const codeA = a.data?.numberCode || '';
        const codeB = b.data?.numberCode || '';
        return codeA.localeCompare(codeB, undefined, { numeric: true });
      });
      node.children.forEach(sortChildren);
    }
  }
  
  roots.forEach(sortChildren);
  return roots;
}

// Hierarchical tree layout using numberCode sequence (Left to Right)
function getHierarchicalLayout(nodes: Node[], edges: Edge[]) {
  const roots = buildHierarchyByNumberCode(nodes, edges);
  if (roots.length === 0) return nodes;
  
  const layoutNodes = new Map<string, Node>();
  const levelWidth = 300;   // Horizontal space between levels
  const siblingGap = 100;   // Vertical space between siblings
  
  function positionNode(node: any, level: number, parentY: number) {
    const children = node.children || [];
    const childCount = children.length;
    
    // Calculate height needed for this subtree
    let subtreeHeight = 0;
    if (childCount > 0) {
      children.forEach((child: any) => {
        subtreeHeight += getSubtreeHeight(child);
      });
      subtreeHeight += (childCount - 1) * siblingGap;
    } else {
      subtreeHeight = nodeHeight;
    }
    
    // Position this node
    const x = level * levelWidth;
    const y = parentY + subtreeHeight / 2;
    
    node.position = { x: x, y: y - nodeHeight / 2 };
    layoutNodes.set(node.id, node);
    
    // Position children
    if (childCount > 0) {
      let childY = y - subtreeHeight / 2;
      children.forEach((child: any) => {
        const childHeight = getSubtreeHeight(child);
        positionNode(child, level + 1, childY);
        childY += childHeight + siblingGap;
      });
    }
  }
  
  function getSubtreeHeight(node: any): number {
    const children = node.children || [];
    if (children.length === 0) return nodeHeight;
    
    let height = 0;
    children.forEach((child: any) => {
      height += getSubtreeHeight(child);
    });
    height += (children.length - 1) * siblingGap;
    return height;
  }
  
  // Position all roots vertically
  let rootY = 0;
  roots.forEach(root => {
    const rootHeight = getSubtreeHeight(root);
    positionNode(root, 0, rootY);
    rootY += rootHeight + 200; // Extra gap between main branches
  });
  
  return nodes.map(n => layoutNodes.get(n.id) || n);
}

// Dagre layout with numberCode ordering
function getDagreLayout(nodes: Node[], edges: Edge[], direction = 'LR') {
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 80,    
    ranksep: 100,    
    ranker: 'longest-path',
    marginx: 30,
    marginy: 30
  });

  // Sort nodes by numberCode before adding to graph
  const sortedNodes = [...nodes].sort((a, b) => {
    const codeA = (a.data?.numberCode as string) || '';
    const codeB = (b.data?.numberCode as string) || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });

  sortedNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
}

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'LR' | 'TD' | 'hierarchical' = 'hierarchical') => {
  if (direction === 'hierarchical') {
    const layoutedNodes = getHierarchicalLayout(nodes, edges);
    return { nodes: layoutedNodes, edges };
  }
  
  return getDagreLayout(nodes, edges, direction);
};
