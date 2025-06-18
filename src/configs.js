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
        {
          type: 'stack',
          id:'DesignModeStack',
          content: [
            {
              type:'component',
              componentName: 'NodeTreeTab',
              id:'NodeTreeTab',
              title:'Node Tree',
              isClosable: false,
              reorderEnabled: false,
            },
           
          ]
        },
        {
          type: 'stack',
          id:'ViewPortStack',
          content: [
            {
              type:'component',
              componentName: 'ViewPortTab',
              id:'ViewPortTab',
              title:'View Port',
              isClosable: false,
              reorderEnabled: false,
            },
           
          ]
        },
      ]
    }
   ]
};

export let editorStackConfig = {
  type: 'stack',
  id: 'editorStack',
  isClosable: true,
  content: [
    {
      type: 'component',
      id: 'editorTab',
      componentName: 'editorTab',
      title: 'Editor',
      isClosable: true,
      reorderEnabled: true,
      content: []
    },
  ]
};