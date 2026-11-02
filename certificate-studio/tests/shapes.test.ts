import { describe, it, expect } from 'vitest';
import {
  normalizeCertificateDesign,
  renderCertificatePreview,
  renderCertificatePreviewDocument,
  DEFAULT_CERTIFICATE_DESIGN_V1,
  type CertificateShapeObject,
  type CertificateDesignV1
} from '../src/kit';

describe('Certificate Studio Shape Layers & Preview Parity', () => {
  it('normalizes legacy designs without shapes safely', () => {
    const legacy = {
      ...DEFAULT_CERTIFICATE_DESIGN_V1,
      title: 'Legacy Certificate'
    };

    const normalized = normalizeCertificateDesign(legacy);
    expect(normalized.shapes).toEqual([]);
    expect(normalized.title).toBe('Legacy Certificate');

    const preview = renderCertificatePreview(normalized);
    expect(preview.html).toContain('Legacy Certificate');
    expect(preview.html).not.toContain('class="studio-shape"');
  });

  it('renders vector shapes in preview document with correct svg geometry and styles', () => {
    const shapes: CertificateShapeObject[] = [
      {
        id: 'shape-box-1',
        objectType: 'shape',
        shape: 'rectangle',
        frame: { x: 40, y: 50, width: 220, height: 110, rotation: 0 },
        fill: { type: 'solid', color: '#2563eb' },
        stroke: { color: '#1e3a8a', width: 2, style: 'solid' },
        borderRadius: 10,
        opacity: 0.95,
        locked: false,
        zIndex: 2
      },
      {
        id: 'shape-grad-circle',
        objectType: 'shape',
        shape: 'ellipse',
        frame: { x: 400, y: 200, width: 140, height: 140, rotation: 30 },
        fill: {
          type: 'linear-gradient',
          angle: 90,
          stops: [
            { offset: 0, color: '#f59e0b' },
            { offset: 1, color: '#ef4444' }
          ]
        },
        stroke: { color: '#b45309', width: 3, style: 'dashed' },
        borderRadius: 0,
        opacity: 0.8,
        locked: false,
        zIndex: 8
      },
      {
        id: 'shape-rule',
        objectType: 'shape',
        shape: 'line',
        frame: { x: 100, y: 500, width: 500, height: 4, rotation: 0 },
        fill: { type: 'none' },
        stroke: { color: '#334155', width: 2, style: 'solid' },
        borderRadius: 0,
        opacity: 1,
        locked: true,
        zIndex: 1
      }
    ];

    const design: CertificateDesignV1 = {
      ...DEFAULT_CERTIFICATE_DESIGN_V1,
      rendererTemplateId: 'modular',
      shapes
    };

    const normalized = normalizeCertificateDesign(design);
    expect(normalized.shapes.length).toBe(3);

    const fullDoc = renderCertificatePreviewDocument(normalized);
    expect(fullDoc).toContain('<!DOCTYPE html>');
    expect(fullDoc).toContain('data-certificate-element="shape-box-1"');
    expect(fullDoc).toContain('data-certificate-element="shape-grad-circle"');
    expect(fullDoc).toContain('data-certificate-element="shape-rule"');

    // SVG elements
    expect(fullDoc).toContain('<rect x="1" y="1" width="218" height="108" rx="9" ry="9" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"');
    expect(fullDoc).toContain('<ellipse cx="70" cy="70" rx="68.5" ry="68.5" fill="url(#grad-shape-grad-circle)" stroke="#b45309" stroke-width="3" stroke-dasharray="6 4"');
    expect(fullDoc).toContain('linearGradient id="grad-shape-grad-circle"');
    expect(fullDoc).toContain('transform:rotate(30deg)');
    expect(fullDoc).toContain('<line x1="0" y1="2" x2="500" y2="2" fill="none" stroke="#334155" stroke-width="2"');
  });

  it('sorts shape layers deterministically by z-index', () => {
    const shapes: CertificateShapeObject[] = [
      {
        id: 'shape-top',
        objectType: 'shape',
        shape: 'rectangle',
        frame: { x: 0, y: 0, width: 50, height: 50, rotation: 0 },
        fill: { type: 'solid', color: '#ff0000' },
        stroke: null,
        borderRadius: 0,
        opacity: 1,
        locked: false,
        zIndex: 99
      },
      {
        id: 'shape-bottom',
        objectType: 'shape',
        shape: 'rectangle',
        frame: { x: 0, y: 0, width: 50, height: 50, rotation: 0 },
        fill: { type: 'solid', color: '#0000ff' },
        stroke: null,
        borderRadius: 0,
        opacity: 1,
        locked: false,
        zIndex: 0
      }
    ];

    const design: CertificateDesignV1 = {
      ...DEFAULT_CERTIFICATE_DESIGN_V1,
      rendererTemplateId: 'modular',
      shapes
    };

    const preview = renderCertificatePreview(design);
    const bottomIndex = preview.html.indexOf('data-certificate-element="shape-bottom"');
    const topIndex = preview.html.indexOf('data-certificate-element="shape-top"');
    expect(bottomIndex).toBeLessThan(topIndex);
  });
});

