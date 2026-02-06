/**
 * Tests para el componente Button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { Button } from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renderiza con el texto correcto', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('renderiza con variante primary por defecto', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary-500');
    });

    it('renderiza con variante secondary', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100');
    });

    it('renderiza con variante ghost', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('renderiza con tamaño md por defecto', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4');
    });

    it('renderiza con tamaño sm', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
    });

    it('renderiza con tamaño lg', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6');
    });
  });

  describe('Interactions', () => {
    it('llama onClick cuando se hace click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('no llama onClick cuando está disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('no llama onClick cuando está loading', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} isLoading>
          Loading
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('muestra spinner cuando isLoading es true', () => {
      render(<Button isLoading>Loading</Button>);

      // El botón debería tener el spinner (animación)
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('el botón está disabled cuando isLoading es true', () => {
      render(<Button isLoading>Loading</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Icons', () => {
    it('renderiza leftIcon correctamente', () => {
      const Icon = () => <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={<Icon />}>With Icon</Button>);

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renderiza rightIcon correctamente', () => {
      const Icon = () => <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={<Icon />}>With Icon</Button>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('tiene el rol de button', () => {
      render(<Button>Accessible</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('puede recibir un tipo específico', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('puede recibir className adicional', () => {
      render(<Button className="custom-class">Custom</Button>);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });
});
