interface TAllocatePageRenderParams {
  // Modules...
  nodes: AllocatePageNodes;
  state: AllocatePageState;
}

class AllocatePageRender implements TAllocatePageRenderParams {
  // Methods...
  updateInputTableState: (type: TAllocationType) => void;
  updateGroupsState: () => void;
}
type TAllocatePageRender = AllocatePageRender;
