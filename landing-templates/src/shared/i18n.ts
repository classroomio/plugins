const messages = {
  en: {
    pickerTitle: 'Creative Landing Page Templates',
    pickerSubtitle: 'Select a unique, modern aesthetic for your academy landing page.',
    preview: 'Preview',
    active: 'Active',
    selected: 'Selected',
    applying: 'Applying...',
    useTemplate: 'Use Template',
    previewFailed: 'Failed to preview template',
    activateFailed: 'Failed to activate template',
    activated: (name: string) => `Activated "${name}" template`,
    signIn: 'Sign In',
    getStarted: 'Get Started',
    featuredMedia: 'Featured Media',
    exploreCourses: 'Explore Courses',
    resources: 'Resources',
    coursesHeading: 'Featured Courses',
    coursesViewAll: 'Browse All Courses',
    coursesEmptyTitle: 'No courses available yet',
    coursesEmptyDescription: 'Check back soon for upcoming courses.',
    courseFree: 'Free',
    courseEnroll: 'Enroll Now',
    courseLessons: 'lessons',
    courseStudents: 'students',
    rightsReserved: 'All rights reserved.'
  },
  fr: {
    pickerTitle: "Modèles créatifs de page d'accueil",
    pickerSubtitle: "Choisissez une esthétique moderne pour la page d'accueil de votre académie.",
    preview: 'Aperçu', active: 'Actif', selected: 'Sélectionné', applying: 'Application...', useTemplate: 'Utiliser le modèle',
    previewFailed: "Impossible d'afficher l'aperçu", activateFailed: "Impossible d'activer le modèle",
    activated: (name: string) => `Modèle « ${name} » activé`, signIn: 'Se connecter', getStarted: 'Commencer',
    featuredMedia: 'Média à la une', exploreCourses: 'Découvrir les cours', resources: 'Ressources',
    coursesHeading: 'Cours à la une', coursesViewAll: 'Voir tous les cours', coursesEmptyTitle: 'Aucun cours disponible',
    coursesEmptyDescription: 'Revenez bientôt pour découvrir les prochains cours.', courseFree: 'Gratuit',
    courseEnroll: "S'inscrire", courseLessons: 'leçons', courseStudents: 'apprenants', rightsReserved: 'Tous droits réservés.'
  },
  es: {
    pickerTitle: 'Plantillas creativas de página de inicio',
    pickerSubtitle: 'Elige una estética moderna para la página de inicio de tu academia.',
    preview: 'Vista previa', active: 'Activa', selected: 'Seleccionada', applying: 'Aplicando...', useTemplate: 'Usar plantilla',
    previewFailed: 'No se pudo mostrar la vista previa', activateFailed: 'No se pudo activar la plantilla',
    activated: (name: string) => `Plantilla «${name}» activada`, signIn: 'Iniciar sesión', getStarted: 'Comenzar',
    featuredMedia: 'Contenido destacado', exploreCourses: 'Explorar cursos', resources: 'Recursos',
    coursesHeading: 'Cursos destacados', coursesViewAll: 'Ver todos los cursos', coursesEmptyTitle: 'Aún no hay cursos disponibles',
    coursesEmptyDescription: 'Vuelve pronto para descubrir nuevos cursos.', courseFree: 'Gratis', courseEnroll: 'Inscribirse',
    courseLessons: 'lecciones', courseStudents: 'estudiantes', rightsReserved: 'Todos los derechos reservados.'
  }
} as const;

export function getMessages(locale?: string) {
  const language = locale?.toLowerCase().split('-')[0] as keyof typeof messages;

  return messages[language] ?? messages.en;
}
