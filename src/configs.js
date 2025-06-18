let editorConfig = {
  type: 'column',
  width: 30,
  content: [
    {
      type: 'stack',
      content: [

        {
          type: 'component',
          id: 'editorTab',
          componentName: 'editorTab',
          title: 'Editor',
          isClosable: false,
        },
        {
          type: 'component',
          id: 'configTab',
          componentName: 'configTab',
          title: 'Config',
          isClosable: false,
        },
      ]
    }
  ]
};
let systemConfig = {
  type: 'stack',
  id: 'DesignModeStack',
  content: [
    {
      type: 'component',
      componentName: 'NodeTreeTab',
      id: 'NodeTreeTab',
      title: 'Node Tree',
      isClosable: false,
      reorderEnabled: false,
    },

  ]
};

let viewPortConfig = {
  type: 'stack',
  id: 'ViewPortStack',
  content: [
    {
      type: 'component',
      componentName: 'ViewPortTab',
      id: 'ViewPortTab',
      title: 'View Port',
      isClosable: false,
      reorderEnabled: false,
    },
    {
      type: 'component',
      componentName: 'FocusPortTab',
      id: 'FocusPortTab',
      title: 'Focus Port',
      isClosable: false,
      reorderEnabled: false,
    },
  ]
};

export let layoutConfig = {
  settings: {
    hasHeaders: true,
    reorderEnabled: true,
    showPopoutIcon: true,
    showMaximiseIcon: true,
    showPopoutIcon: false,
    showCloseIcon: true // allow close icons globally
  },
  content: [
    {
      type: 'row',
      content: [
        systemConfig,
        viewPortConfig,
        editorConfig
      ]
    }
  ]
};
