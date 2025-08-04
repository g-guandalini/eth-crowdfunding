// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import ProjectsList from '../components/ProjectsList.vue'; 
import CreateProject from '../components/CreateProject.vue'; 
import ProjectPage from '../components/ProjectPage.vue';

const routes = [
  {
    path: '/',
    name: 'ProjectsList',
    component: ProjectsList,
  },
  {
    path: '/create',
    name: 'CreateProject',
    component: CreateProject,
  },
  {
    path: '/project/:id', 
    name: 'project-details',
    component: ProjectPage,
    props: true,  
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;