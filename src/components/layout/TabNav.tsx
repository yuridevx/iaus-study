import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Curves' },
  { path: '/multi', label: 'Multi' },
  { path: '/simulator', label: 'Simulator' },
  { path: '/library', label: 'Library' },
  { path: '/presets', label: 'Presets' },
];

export const TabNav = () => {
  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
