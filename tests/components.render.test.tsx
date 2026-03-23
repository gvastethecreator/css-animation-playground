/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ActivationSwitch from '../components/ActivationSwitch';
import ToggleControl from '../components/ToggleControl';
import StageElementSelector from '../components/StageElementSelector';

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
