// utils/sessionLayout.js
export function saveLayoutToSession(layoutName, reports) {
  const layouts = JSON.parse(sessionStorage.getItem('dashboard_layouts') || '{}');
  layouts[layoutName] = reports;
  sessionStorage.setItem('dashboard_layouts', JSON.stringify(layouts));
}

export function loadLayoutsFromSession() {
  return JSON.parse(sessionStorage.getItem('dashboard_layouts') || '{}');
}

export function deleteLayoutFromSession(layoutName) {
  const layouts = loadLayoutsFromSession();
  delete layouts[layoutName];
  sessionStorage.setItem('dashboard_layouts', JSON.stringify(layouts));
}
