// @ts-check

export const RecentProcessesListHelpers = {
  /** Extend processes data with dattributes data
   * @param {TRecentProcesses} recentProcesses
   * @param {TProcessAttributes[]} processesAttributes
   * @return {TRecentProcesses} - Returns updated processes data
   */
  extendRecentProcessesWithAttributes(recentProcesses, processesAttributes) {
    /** @type {Map<number, TProcessAttributes>} */
    const attrsMap = new Map();
    processesAttributes.forEach((attrs) => attrsMap.set(attrs.id, attrs));
    const updatedProcesses = recentProcesses.map((item) => {
      const attrs = attrsMap.get(item.id);
      if (attrs && attrs.name) {
        return { ...item, name: attrs.name };
      }
      return item;
    });
    return updatedProcesses;
  },
};
