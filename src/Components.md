# Project Name (Tauri Frontend)

This project utilizes a structured, component-based architecture for the frontend, ensuring scalability, maintainability, and clear separation of concerns. The structure is based on the principle of increasing **Granularity and Scope**.

---

## 🏗 Folder Structure & Design Principles

The `src` directory organizes UI elements from the smallest, reusable unit up to complete pages, followed by non-UI dependencies.

| Folder | Design Principle | Description |
| :--- | :--- | :--- |
| **Atomic-UI** | **A-Design-Blocks** | Foundational, single-purpose elements (e.g., buttons, inputs, icons). These are the smallest, purest components. |
| **Basic-UI** | **B-Functional-Blocks** | Standalone functional units, often composed of Atomic-UI or independent code (e.g., Grid View, simple charts). |
| **Component-UI** | **C-Advanced-Blocks** | Finished, specific-use components, often composed of Atomic and Basic blocks (e.g., Chatbot, File Browser). |
| **Module-UI** | **D-View-Blocks** | Structural segments of a page (e.g., Header, Sidebar, Footer, reusable content sections). |
| **Page-UI** | **E-Page-Blocks** | Complete screen views or application pages, composed of Components and Modules. |
| **Services** | **F-Utility-Block** | Non-UI, utility code (e.g., data-store logic, API handlers, system scripts). |
| **Sources** | **G-Root-Block** | Root-level configuration, entry points, and global files (e.g., `main-desktop.js` equivalents). |  
  