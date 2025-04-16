## 侧边栏设计

1. 多级目录与文件
2. 可以在目录上点击按钮创建文件
3. 可以在最上方的标题上点击按钮创建文件
4. 允许存在没有父目录的文件
5. 当用户点击某个文件夹时展开
6. 当用户点击某个文件时显示一个选中效果并加载内容
7. 当用户点击创建文件时：

   1. 显示一个输入框输入文件的名字
   2. 聚焦到输入框，默认值为未命名
   3. 当用户回车后修改文件的名字

8. 需要支持拖拽移动文件和目录

## 侧边栏优化

1. 需要实现note 和notebook 的多级任意组合，可以通过合并note 和notebook 数据类型来实现，通过type字段来区分

## gpt 提供的优化

侧边栏树结构实现分析
根据代码查看，侧边栏的树结构实现由以下几个关键部分组成:
TreeNode 接口定义了树节点的基本结构:
icon: 图标
key: 唯一标识符
label: 显示名称
children: 子节点
data: 节点数据
type: 节点类型('folder' 或 'file')
selected: 是否被选中
parentId: 父节点ID
level: 层级深度
isExpanded: 是否展开
isNew: 是否新建
树的操作主要包括:
添加节点: addTreeNode、addNoteInFolder、addRootNote
删除节点: deleteTreeNode、deleteNote、deleteFolder
重命名: renameTreeNode、updateNote、updateFolder
移动: moveTreeNode、moveNote、moveFolder
拖拽功能实现:
实现了拖拽接口处理(onDragStart, onDrop等)
包括节点间的移动和跨层级拖放
支持自动滚动功能
UI组件结构:
sidebar/index.vue: 侧边栏主组件
tree.vue: 树状结构组件
treeItem.vue: 单个树节点组件
您之前的修改是将根目录的笔记直接作为根节点显示，而不是创建一个专门的根文件夹节点，这样笔记可以更直观地展示在侧边栏中。
树结构的构建是通过loadNodeTree方法完成的，它加载根笔记和笔记本，构建树节点，并合并到treeLabels状态中。
右键菜单提供了对节点的操作，如重命名、删除和移动等功能。节点支持拖拽重新组织，包括文件夹和文件的移动。
这个实现提供了一个功能完整的文件树结构，支持用户友好的操作方式。
