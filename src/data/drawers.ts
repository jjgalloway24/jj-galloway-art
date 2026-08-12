import type { DrawerId } from "../state/CabinetContext";

export interface DrawerConfig {
  id: DrawerId;
  label: string;
  nodeName: string;
  folderNodeName: string;
  drawerClip: string;
  folderClip: string;
  tabColor: string;
  // approximate world Y of this drawer, for camera framing only (CameraRig).
  approxY: number;
}

// nodeName/folderNodeName/drawerClip/folderClip must match the object and
// animation names in public/models/filing-cabinet.glb.
export const DRAWERS: DrawerConfig[] = [
  {
    id: "portfolio",
    label: "Portfolio",
    nodeName: "Drawer_Portfolio",
    folderNodeName: "Portfolio_Folder",
    drawerClip: "Drawer_PortfolioAction",
    folderClip: "Portfolio_folder_Open",
    tabColor: "#4d8fdd",
    approxY: 0.848,
  },
  {
    id: "about",
    label: "About Me",
    nodeName: "Drawer_About",
    folderNodeName: "AboutMe_Folder",
    drawerClip: "About_Open",
    folderClip: "About_folder_Open",
    tabColor: "#5fb87a",
    approxY: 0.527,
  },
  {
    id: "archive",
    label: "Archive",
    nodeName: "Drawer_Archive",
    folderNodeName: "Archive_Folder",
    drawerClip: "Archive_Open",
    folderClip: "Archive_folder_Open",
    tabColor: "#d9a441",
    approxY: 0.214,
  },
];
