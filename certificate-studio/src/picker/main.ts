import '@classroomio/plugin-design/tokens.css';
import '@classroomio/plugin-design/components.css';
import { mount } from 'svelte';
import TemplatePicker from './TemplatePicker.svelte';

mount(TemplatePicker, { target: document.getElementById('app')! });
