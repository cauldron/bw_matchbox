declare global {
  const modules: {
    define: (id: string, deps: string[], provide: ([...modules]) => any) => void;
  };
}
export default global;
