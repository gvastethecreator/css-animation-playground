import React from 'react';
import { Power } from 'lucide-react';
import Tooltip from './Tooltip';

interface ActivationSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
  color?: string;
}

const ActivationSwitch: React.FC<ActivationSwitchProps> = ({ isEnabled, onToggle, color = '#818cf8' }) => (
  <Tooltip content={isEnabled ? 'Disable Property' : 'Enable Property'}>
    <button onClick={onToggle} className="group pointer-events-auto">
      <Power size={14} strokeWidth={3} className={`transition-colors ${isEnabled ? '' : 'text-zinc-600 group-hover:text-zinc-400'}`} style={{ color: isEnabled ? color : undefined }} />
    </button>
  </Tooltip>
);

export default ActivationSwitch;