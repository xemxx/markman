export interface TreeNode {
  icon: string
  key: string
  label: string
  children?: TreeNode[]
  data: any
  type: string
  selected: boolean
}
