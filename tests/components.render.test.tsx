/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ActivationSwitch from '../components/ActivationSwitch';
import ToggleControl from '../components/ToggleControl';
import StageElementSelector from '../components/StageElementSelector';
import ControlGroup from '../components/ControlGroup';
import RangeControl from '../components/RangeControl';
import ColorControl from '../components/ColorControl';
import EngineSelector from '../components/EngineSelector';
import PositionGrid from '../components/PositionGrid';
import FrameCounter from '../components/FrameCounter';
import ShortcutHelp from '../components/ShortcutHelp';

vi.mock('../components/Tooltip', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/KeyframeButton', () => ({
    default: ({ onClick }: { onClick: () => void }) => (
        <button type="button" onClick={onClick} aria-label="toggle-keyframe">
            keyframe
        </button>
    ),
}));

describe('small component render coverage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ActivationSwitch calls onToggle when clicked', () => {
        const onToggle = vi.fn();
        render(<ActivationSwitch isEnabled={false} onToggle={onToggle} />);

        fireEvent.click(screen.getByRole('button'));
        expect(onToggle).toHaveBeenCalledOnce();
    });

    it('ToggleControl toggles value and triggers keyframe button', () => {
        const onChange = vi.fn();
        const onKeyframeToggle = vi.fn();

        render(
            <ToggleControl
                label="Opacity"
                value={false}
                onChange={onChange}
                propertyKey="opacityEnabled"
                isAnimated={true}
                hasKeyframeAtCurrentTime={false}
                onKeyframeToggle={onKeyframeToggle}
            />,
        );

        expect(screen.getByText('Opacity')).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        fireEvent.click(screen.getByLabelText('toggle-keyframe'));
        fireEvent.click(buttons[1]);

        expect(onKeyframeToggle).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('StageElementSelector emits the selected stage element', () => {
        const onElementChange = vi.fn();
        render(
            <StageElementSelector
                selectedElement="card"
                onElementChange={onElementChange}
                hasMedia={false}
            />,
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(5);

        fireEvent.click(buttons[3]);
        expect(onElementChange).toHaveBeenCalledWith('image');
    });
});

describe('ControlGroup', () => {
    it('renders title and children when open (default)', () => {
        render(
            <ControlGroup title="Test Group">
                <span>child content</span>
            </ControlGroup>,
        );

        expect(screen.getByText('Test Group')).toBeInTheDocument();
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('toggles children visibility on click', () => {
        render(
            <ControlGroup title="Collapsible">
                <span>inner</span>
            </ControlGroup>,
        );

        const toggleBtn = screen.getByRole('button', { name: /collapsible/i });
        // Initially open — children visible
        const wrapper = screen.getByText('inner').closest('div[class*="overflow-hidden"]')!;
        expect(wrapper.className).toContain('max-h-[1000px]');

        // Click to collapse
        fireEvent.click(toggleBtn);
        expect(wrapper.className).toContain('max-h-0');

        // Click to re-open
        fireEvent.click(toggleBtn);
        expect(wrapper.className).toContain('max-h-[1000px]');
    });

    it('starts collapsed when defaultOpen is false', () => {
        render(
            <ControlGroup title="Closed" defaultOpen={false}>
                <span>hidden</span>
            </ControlGroup>,
        );

        const wrapper = screen.getByText('hidden').closest('div[class*="overflow-hidden"]')!;
        expect(wrapper.className).toContain('max-h-0');
    });
});

describe('RangeControl', () => {
    const baseProps = {
        label: <span>Rotate X</span>,
        value: 45,
        onChange: vi.fn(),
        min: -360,
        max: 360,
        step: 1,
        unit: '°',
        propertyKey: 'rotateX' as const,
        isAnimated: false,
        hasKeyframeAtCurrentTime: false,
        onKeyframeToggle: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders label and formatted value', () => {
        render(<RangeControl {...baseProps} />);
        expect(screen.getByText('Rotate X')).toBeInTheDocument();
        expect(screen.getByText('45°')).toBeInTheDocument();
    });

    it('calls onChange when slider moves', () => {
        render(<RangeControl {...baseProps} />);
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '90' } });
        expect(baseProps.onChange).toHaveBeenCalledWith(90);
    });

    it('enters edit mode on value click and commits on Enter', () => {
        render(<RangeControl {...baseProps} />);
        // Click the display value to enter edit mode
        fireEvent.click(screen.getByText('45°'));
        const input = screen.getByRole('spinbutton');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: '180' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(baseProps.onChange).toHaveBeenCalledWith(180);
    });

    it('clamps value to min/max on commit', () => {
        render(<RangeControl {...baseProps} />);
        fireEvent.click(screen.getByText('45°'));
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '999' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(baseProps.onChange).toHaveBeenCalledWith(360);
    });

    it('reverts on Escape', () => {
        render(<RangeControl {...baseProps} />);
        fireEvent.click(screen.getByText('45°'));
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '999' } });
        fireEvent.keyDown(input, { key: 'Escape' });
        // Should not call onChange — value restored
        expect(baseProps.onChange).not.toHaveBeenCalled();
        // Verify display shows original value
        expect(screen.getByText('45°')).toBeInTheDocument();
    });

    it('is disabled when isActivatable is true and isEnabled is false', () => {
        const { container } = render(
            <RangeControl {...baseProps} isActivatable isEnabled={false} />,
        );
        expect(container.firstElementChild!.className).toContain('pointer-events-none');
    });
});

describe('ColorControl', () => {
    const baseProps = {
        label: <span>Shadow Color</span>,
        value: 'rgba(0, 0, 0, 0.5)',
        onChange: vi.fn(),
        propertyKey: 'dropShadowColor' as const,
        isAnimated: false,
        hasKeyframeAtCurrentTime: false,
        onKeyframeToggle: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders label and color swatch', () => {
        render(<ColorControl {...baseProps} />);
        expect(screen.getByText('Shadow Color')).toBeInTheDocument();
        // The color swatch button should exist
        const swatchBtn = screen.getAllByRole('button').find(
            b => b.style.backgroundColor === 'rgba(0, 0, 0, 0.5)',
        );
        expect(swatchBtn).toBeDefined();
    });

    it('renders alpha slider', () => {
        render(<ColorControl {...baseProps} />);
        const sliders = screen.getAllByRole('slider');
        // Alpha slider should be present
        expect(sliders.length).toBeGreaterThanOrEqual(1);
    });
});

describe('EngineSelector', () => {
    it('renders all engine buttons', () => {
        const onChange = vi.fn();
        render(<EngineSelector engine="css" onEngineChange={onChange} />);
        expect(screen.getByText('css')).toBeInTheDocument();
        expect(screen.getByText('gsap')).toBeInTheDocument();
        expect(screen.getByText('motion')).toBeInTheDocument();
        expect(screen.getByText('animejs')).toBeInTheDocument();
    });

    it('calls onEngineChange when a different engine is clicked', () => {
        const onChange = vi.fn();
        render(<EngineSelector engine="css" onEngineChange={onChange} />);
        fireEvent.click(screen.getByText('gsap'));
        expect(onChange).toHaveBeenCalledWith('gsap');
    });
});

describe('PositionGrid', () => {
    it('renders 9 position buttons', () => {
        const onChange = vi.fn();
        render(
            <PositionGrid
                valueX={50}
                valueY={50}
                onChange={onChange}
                propertyKeyX="transformOriginX"
                isAnimated={false}
                hasKeyframeAtCurrentTime={false}
                onKeyframeToggle={vi.fn()}
            />,
        );
        const buttons = screen.getAllByRole('button');
        // 9 grid positions + 1 keyframe button = 10
        expect(buttons).toHaveLength(10);
    });

    it('calls onChange with correct coordinates for top-left', () => {
        const onChange = vi.fn();
        render(
            <PositionGrid
                valueX={50}
                valueY={50}
                onChange={onChange}
                propertyKeyX="transformOriginX"
                isAnimated={false}
                hasKeyframeAtCurrentTime={false}
                onKeyframeToggle={vi.fn()}
            />,
        );
        // First grid button = top-left (0,0)
        const gridButtons = screen.getAllByRole('button').filter(b => b.getAttribute('aria-label') !== 'toggle-keyframe');
        fireEvent.click(gridButtons[0]);
        expect(onChange).toHaveBeenCalledWith(0, 0);
    });
});

describe('FrameCounter', () => {
    it('renders current frame based on time and fps', () => {
        const { container } = render(<FrameCounter currentTime={500} fps={30} />);
        // frame = Math.floor(500 / (1000/30)) = Math.floor(14.999...) = 14 (JS float precision)
        expect(container.textContent).toContain('14');
    });

    it('shows frame 0 at time 0', () => {
        const { container } = render(<FrameCounter currentTime={0} fps={60} />);
        expect(container.textContent).toContain('0');
    });
});

describe('ShortcutHelp', () => {
    it('renders all shortcut sections', () => {
        const onClose = vi.fn();
        render(<ShortcutHelp onClose={onClose} />);
        expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
        expect(screen.getByText('Playback')).toBeInTheDocument();
        expect(screen.getByText('Timeline')).toBeInTheDocument();
        expect(screen.getByText('General')).toBeInTheDocument();
    });

    it('calls onClose when clicking the close button', () => {
        const onClose = vi.fn();
        render(<ShortcutHelp onClose={onClose} />);
        // Find the close button (X icon button)
        const closeBtn = screen.getAllByRole('button')[0];
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose on Escape key', () => {
        const onClose = vi.fn();
        render(<ShortcutHelp onClose={onClose} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
    });
});
