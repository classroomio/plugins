import '@classroomio/plugin-design/tokens.css';
import '@classroomio/plugin-design/components.css';
import { mount } from 'svelte';
import Banner from './Banner.svelte';

mount(Banner, { target: document.getElementById('app')! });
