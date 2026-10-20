import '@classroomio/plugin-design/tokens.css';
import '@classroomio/plugin-design/components.css';
import { mount } from 'svelte';
import Settings from './Settings.svelte';

mount(Settings, { target: document.getElementById('app')! });
