class TAllocatePageHandlersParams {
  // Modules...
  nodes: AllocatePageNodes;
  state: AllocatePageState;
  render: AllocatePageRender;
  callbacks: TSharedHandlers;
}

class AllocatePageHandlers implements TAllocatePageHandlersParams {}
type TAllocatePageHandlers = AllocatePageHandlers;
