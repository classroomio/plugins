import './app.css';
import { mount } from 'svelte';
import StudioApp from './StudioApp.svelte';

mount(StudioApp, { target: document.getElementById('app')! });

