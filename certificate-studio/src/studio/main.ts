import '@classroomio/plugin-design/tokens.css';
import '@classroomio/plugin-design/components.css';
import { mount } from 'svelte';
import StudioApp from './StudioApp.svelte';

mount(StudioApp, { target: document.getElementById('app')! });
