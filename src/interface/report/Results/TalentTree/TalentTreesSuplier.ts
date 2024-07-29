import talentTrees from '../../../../../public/specs.json';

export interface TalentTree {
  traitTreeId: number;
  className: string;
  classId: number;
  specName: string;
  specId: number;
  classNodes: TalentNode[];
  specNodes: TalentNode[];
  heroNodes: TalentNode[];
  subTreeNodes?: SubTreeNode[];
  fullNodeOrder: number[];
}

export interface TalentNode {
  id: number;
  name: string;
  type: string;
  posX: number;
  posY: number;
  maxRanks?: number;
  entryNode?: boolean;
  subTreeId?: number;
  next: number[];
  prev: number[];
  entries: TalentNodeEntry[];
}

export interface TalentNodeEntry {
  id: number;
  definitionId: number;
  maxRanks: number;
  type: string;
  name: string;
  spellId: number;
  icon: string;
  index: number;
}

export interface SubTreeNode {
  id: number;
  name: string;
  type: string;
  posX: number;
  posY: number;
  entryNode: boolean;
  next: number[];
  prev: number[];
  entries: SubTreeEntry[];
}

export interface SubTreeEntry {
  id: number;
  type: string;
  name: string;
  traitSubTreeId: number;
  traitTreeId: number;
  atlasMemberName: string;
  nodes: number[];
}

export function getTalentTree(specId: number): TalentTree | null {
  const specTree = talentTrees.find((talentTree: TalentTree) => talentTree.specId === specId);

  return specTree ? specTree : null;
}
