// Contenu du cours de code de la route
// Remplacez les videoUrl par vos vraies URLs de vidéos (YouTube, Vimeo, ou auto-hébergé)

export const COURSES = [
  {
    id: 1,
    theme: "Thème 1",
    title: "Le conducteur",
    description: "Alcool, drogues, médicaments, fatigue et les sens du conducteur.",
    thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "1-1",
        title: "Vidéo : Le conducteur et ses responsabilités",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=NydKYZAkdVs", // Remplacer par votre vraie vidéo
        duration: "14:32",
        description: "Dans ce cours, nous abordons les obligations du conducteur, l'impact de l'alcool, des drogues et de la fatigue sur la conduite. Ces notions sont fondamentales pour réussir l'examen du code de la route.",
        keyPoints: [
          "Le taux légal d'alcool est de 0,5 g/L de sang (0,2 g/L pour les jeunes conducteurs).",
          "La fatigue divise par deux les réflexes du conducteur.",
          "Certains médicaments (triangle rouge) sont incompatibles avec la conduite.",
          "L'utilisation du téléphone portable au volant est interdite, même au feu rouge.",
        ]
      },
      {
        id: "1-2",
        title: "Questions d'entraînement : Le conducteur",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "Quel est le taux d'alcoolémie maximum autorisé pour un conducteur titulaire du permis depuis plus de 3 ans ?",
            options: ["0,2 g/L de sang", "0,5 g/L de sang", "0,8 g/L de sang", "1,0 g/L de sang"],
            correct: 1,
            explanation: "Le taux légal est de 0,5 g/L de sang (soit 0,25 mg/L d'air expiré) pour les conducteurs confirmés. Pour les jeunes conducteurs (moins de 3 ans de permis), le taux est de 0,2 g/L."
          },
          {
            id: "q2",
            text: "Vous êtes fatigué sur l'autoroute. Que devez-vous faire en priorité ?",
            options: ["Ouvrir la fenêtre et continuer", "Boire un café et reprendre la route", "Vous arrêter à la prochaine aire de repos et dormir", "Augmenter la vitesse pour arriver plus vite"],
            correct: 2,
            explanation: "Seul le sommeil peut combattre la fatigue. L'ouverture de la fenêtre et le café n'ont qu'un effet temporaire et trompeur."
          },
          {
            id: "q3",
            text: "Un médicament portant un triangle rouge sur sa boîte indique qu'il :",
            options: ["Peut être pris sans danger avant de conduire", "Est dangereux pour la conduite, la conduite est déconseillée", "Doit être conservé au froid", "Est remboursé par la sécurité sociale"],
            correct: 1,
            explanation: "Le triangle rouge (pictogramme niveau 2) signifie que le médicament peut altérer les capacités de conduite. Il est dangereux de conduire sous ce traitement."
          },
          {
            id: "q4",
            text: "L'utilisation du téléphone tenu en main au volant est interdite :",
            options: ["Uniquement sur autoroute", "Uniquement lors de la conduite à plus de 50 km/h", "À tout moment, y compris à l'arrêt au feu rouge", "Sauf en cas d'urgence"],
            correct: 2,
            explanation: "L'utilisation du téléphone tenu en main est interdite dès que le moteur est en marche, même à l'arrêt au feu rouge. Le non-respect est puni d'une amende de 135€ et d'un retrait de 3 points."
          },
          {
            id: "q5",
            text: "Le cannabis consommé la veille peut-il affecter la conduite le lendemain ?",
            options: ["Non, l'effet disparaît en quelques heures", "Oui, les effets peuvent persister plusieurs heures voire jours", "Seulement si consommé en grande quantité", "Non, seul l'alcool est dangereux pour la conduite"],
            correct: 1,
            explanation: "Le THC (principe actif du cannabis) peut rester actif dans l'organisme et affecter les réflexes pendant plusieurs heures. La conduite sous l'emprise de stupéfiants est un délit."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    theme: "Thème 2",
    title: "La maîtrise du véhicule",
    description: "Freinage, stabilité, chargement, équipements de sécurité.",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "2-1",
        title: "Vidéo : Physique du freinage et stabilité",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplacer
        duration: "16:45",
        description: "Comprenez les forces qui s'exercent sur votre véhicule : la distance de freinage, l'effet de l'aquaplanage et la gestion du chargement.",
        keyPoints: [
          "La distance de freinage est proportionnelle au carré de la vitesse.",
          "Par temps de pluie, la distance de freinage est multipliée par 2.",
          "L'aquaplanage survient quand un film d'eau s'interpose entre le pneu et la route.",
          "Un chargement mal arrimé peut provoquer une perte de contrôle.",
        ]
      },
      {
        id: "2-2",
        title: "Questions d'entraînement : La maîtrise du véhicule",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "À 90 km/h sur route mouillée, la distance de freinage par rapport à la route sèche est :",
            options: ["Identique", "Multipliée par 1,5", "Multipliée par 2", "Multipliée par 3"],
            correct: 2,
            explanation: "Sur route mouillée, la distance de freinage est environ doublée car l'adhérence est réduite. Sur neige ou verglas, elle peut être multipliée par 4 à 8."
          },
          {
            id: "q2",
            text: "L'aquaplanage est un phénomène qui :",
            options: ["Se produit uniquement à grande vitesse", "Provoque la perte d'adhérence des pneus sur une flaque d'eau", "Est évité par les pneus neufs seulement si la vitesse est élevée", "N'arrive qu'aux véhicules lourds"],
            correct: 1,
            explanation: "L'aquaplanage se produit quand un film d'eau s'interpose entre le pneu et la chaussée, provoquant une perte totale d'adhérence et de directivité. Pour l'éviter : réduire la vitesse, avoir des pneus en bon état."
          },
          {
            id: "q3",
            text: "La pression des pneus doit être vérifiée :",
            options: ["Une fois par an", "Tous les 6 mois", "Au moins une fois par mois, pneus froids", "Seulement avant un long trajet"],
            correct: 2,
            explanation: "La pression des pneus doit être vérifiée mensuellement, pneus froids (avant de rouler ou après moins de 2 km). Une pression insuffisante augmente la consommation et réduit l'adhérence."
          },
          {
            id: "q4",
            text: "En cas de crevaison soudaine à haute vitesse, vous devez :",
            options: ["Freiner brusquement", "Accélérer pour stabiliser le véhicule", "Tenir fermement le volant, lâcher l'accélérateur progressivement et freiner doucement", "Braquer dans le sens opposé"],
            correct: 2,
            explanation: "En cas de crevaison : saisir fermement le volant, relâcher l'accélérateur en douceur, freiner progressivement, et vous arrêter sur le côté droit de la chaussée."
          },
          {
            id: "q5",
            text: "Un véhicule est en surcharge quand :",
            options: ["Il transporte plus de 4 passagers", "Son poids total dépasse le PTAC indiqué sur la carte grise", "Les pneus sont sous-gonflés", "La consommation d'essence augmente"],
            correct: 1,
            explanation: "Le PTAC (Poids Total Autorisé en Charge) est la masse maximale que peut supporter le véhicule. Le dépasser est dangereux (freinage allongé, usure prématurée) et constitue une infraction."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    theme: "Thème 3",
    title: "La circulation routière",
    description: "Règles de priorité, signalisation, intersections, giratoires.",
    thumbnail: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "3-1",
        title: "Vidéo : Priorités, intersections et giratoires",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplacer
        duration: "18:20",
        description: "Maîtrisez les règles de priorité à droite, les différents types d'intersections et le fonctionnement des ronds-points.",
        keyPoints: [
          "La priorité à droite s'applique en l'absence de signalisation spécifique.",
          "Dans un giratoire, les véhicules engagés sont prioritaires sur ceux qui entrent.",
          "Le panneau Stop impose un arrêt total, même si la voie est libre.",
          "Le feu orange clignotant indique une priorité à droite.",
        ]
      },
      {
        id: "3-2",
        title: "Questions d'entraînement : Circulation routière",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "Dans un carrefour sans signalisation, qui est prioritaire ?",
            options: ["Celui qui arrive le premier", "Le véhicule venant de droite", "Le véhicule venant de gauche", "Le véhicule le plus rapide"],
            correct: 1,
            explanation: "En l'absence de signalisation, la règle de la priorité à droite s'applique : tout véhicule venant de votre droite est prioritaire."
          },
          {
            id: "q2",
            text: "Dans un giratoire (rond-point), qui est prioritaire ?",
            options: ["Les véhicules qui entrent dans le giratoire", "Les véhicules déjà engagés dans le giratoire", "Les poids lourds", "Selon le sens de circulation"],
            correct: 1,
            explanation: "Dans un giratoire moderne (signalé par 'Vous n'avez pas la priorité'), les véhicules déjà engagés dans l'anneau sont prioritaires sur ceux qui entrent."
          },
          {
            id: "q3",
            text: "À un panneau STOP, vous devez :",
            options: ["Ralentir et passer si la voie est libre", "Marquer l'arrêt total, même si vous voyez que la voie est libre", "Klaxonner et passer", "Vous arrêter uniquement si un véhicule arrive"],
            correct: 1,
            explanation: "Le panneau STOP impose un arrêt total et absolu, même si la voie est libre. L'arrêt doit être effectué avant la ligne d'arrêt."
          },
          {
            id: "q4",
            text: "Le clignotant signale à l'avance :",
            options: ["Qu'on change de direction", "Qu'on accélère", "Qu'on freine", "Qu'on s'arrête"],
            correct: 0,
            explanation: "Le clignotant est un avertisseur de changement de direction. Il doit être actionné AVANT la manœuvre pour prévenir les autres usagers."
          },
          {
            id: "q5",
            text: "Un feu tricolore passe à l'orange. Vous pouvez passer si :",
            options: ["Vous pouvez vous arrêter sans danger", "Vous êtes trop engagé pour vous arrêter sans danger", "Personne ne vient en face", "Vous roulez à moins de 50 km/h"],
            correct: 1,
            explanation: "Le feu orange signifie 'arrêtez-vous' SAUF si vous êtes trop engagé pour pouvoir freiner en toute sécurité. Ce n'est pas une autorisation de passer !"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    theme: "Thème 4",
    title: "La route",
    description: "Types de routes, autoroutes, voies rapides, marquages au sol.",
    thumbnail: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "4-1",
        title: "Vidéo : Autoroutes, routes nationales et voies rapides",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplacer
        duration: "13:55",
        description: "Les règles spécifiques à chaque type de voie : vitesses maximales, interdictions, comportements en cas d'urgence.",
        keyPoints: [
          "Sur autoroute : 130 km/h (110 km/h par pluie, 50 km/h en cas de brouillard).",
          "La bande d'arrêt d'urgence est réservée aux véhicules immobilisés.",
          "Le dépassement par la droite est interdit sauf en cas d'embouteillage.",
          "L'arrêt et le stationnement sont interdits sur l'autoroute.",
        ]
      },
      {
        id: "4-2",
        title: "Questions d'entraînement : La route",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "Sur autoroute, la vitesse maximale par temps sec est de :",
            options: ["110 km/h", "120 km/h", "130 km/h", "150 km/h"],
            correct: 2,
            explanation: "La vitesse maximale sur autoroute est de 130 km/h par temps sec, 110 km/h par temps de pluie et 50 km/h en cas de brouillard dense (visibilité < 50 m)."
          },
          {
            id: "q2",
            text: "La bande d'arrêt d'urgence (BAU) est réservée :",
            options: ["Aux dépassements en cas d'embouteillage", "Aux véhicules en panne ou en cas d'urgence uniquement", "Aux motocyclistes", "Aux véhicules roulant à moins de 80 km/h"],
            correct: 1,
            explanation: "La BAU est réservée exclusivement aux véhicules immobilisés en cas de panne ou d'urgence. Circuler sur la BAU est une infraction grave (amende + retrait de points)."
          },
          {
            id: "q3",
            text: "En cas de panne sur autoroute, après avoir activé les feux de détresse, vous devez :",
            options: ["Rester dans votre véhicule et attendre", "Sortir du véhicule côté conducteur et marcher derrière le rail de sécurité", "Sortir du véhicule par la gauche", "Pousser votre véhicule hors de la BAU"],
            correct: 1,
            explanation: "En cas de panne : activer les feux de détresse, sortir côté passager (ou par derrière), placer le triangle de signalisation, et se mettre derrière le rail de sécurité. Ne jamais rester dans le véhicule arrêté sur la BAU."
          },
          {
            id: "q4",
            text: "Sur une route à double sens de circulation avec une ligne continue au centre, vous pouvez :",
            options: ["La franchir pour dépasser si la visibilité est bonne", "Ne jamais la franchir ni la chevaucher", "La franchir uniquement pour tourner à gauche", "La franchir si votre voie est libre"],
            correct: 1,
            explanation: "La ligne continue ne doit jamais être franchie ni chevauchée. Elle indique une zone dangereuse où le dépassement est formellement interdit."
          },
          {
            id: "q5",
            text: "La distance de sécurité minimale recommandée sur autoroute à 130 km/h est :",
            options: ["50 mètres (1 seconde)", "108 mètres (3 secondes)", "2 secondes minimum (soit environ 72 mètres)", "4 secondes minimum"],
            correct: 2,
            explanation: "La règle des 2 secondes minimum est recommandée. La loi impose de maintenir une distance de sécurité représentée par la distance parcourue en 2 secondes, soit environ 72 mètres à 130 km/h."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    theme: "Thème 5",
    title: "Les autres usagers",
    description: "Piétons, cyclistes, motards, camions. Cohabiter en sécurité.",
    thumbnail: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "5-1",
        title: "Vidéo : Partager la route en sécurité",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplacer
        duration: "12:10",
        description: "Comment anticiper et adapter sa conduite en présence des usagers vulnérables : piétons, cyclistes, deux-roues motorisés.",
        keyPoints: [
          "Les piétons ont toujours la priorité sur les passages piétons.",
          "Les cyclistes peuvent circuler sur les voies de bus et dépasser par la droite.",
          "Il faut laisser 1 mètre de distance en dépassant un cycliste en agglomération (1,5 m hors agglo).",
          "Les angles morts des poids lourds représentent un danger réel.",
        ]
      },
      {
        id: "5-2",
        title: "Questions d'entraînement : Les autres usagers",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "À un passage piéton, un piéton s'apprête à traverser. Vous devez :",
            options: ["Accélérer pour passer avant lui", "Klaxonner pour le prévenir", "Céder le passage et vous arrêter si nécessaire", "Ralentir mais continuer si vous arrivez en premier"],
            correct: 2,
            explanation: "Les piétons sont prioritaires sur les passages piétons dès qu'ils manifestent l'intention de traverser (ils s'approchent du bord). Vous devez obligatoirement céder le passage."
          },
          {
            id: "q2",
            text: "Quelle distance latérale minimale devez-vous maintenir en dépassant un cycliste hors agglomération ?",
            options: ["0,5 mètre", "1 mètre", "1,5 mètre", "2 mètres"],
            correct: 2,
            explanation: "Hors agglomération, la distance latérale minimale lors du dépassement d'un cycliste est de 1,5 mètre. En agglomération, elle est de 1 mètre."
          },
          {
            id: "q3",
            text: "Un motocycliste circulant entre les files de véhicules à l'arrêt est :",
            options: ["En infraction, ce n'est pas autorisé", "Autorisé uniquement sur voie rapide", "En expérimentation légale dans certaines zones", "Toujours autorisé sur autoroute"],
            correct: 2,
            explanation: "La remontée de file par les deux-roues est expérimentée dans certains départements depuis 2016. Elle est autorisée dans les zones expérimentales balisées, sur autoroutes et voies rapides à plus de 3 voies, à moins de 50 km/h."
          },
          {
            id: "q4",
            text: "En approchant un bus scolaire arrêté avec ses feux de détresse allumés, vous devez :",
            options: ["Accélérer pour passer rapidement", "Ralentir très fortement et être prêt à s'arrêter", "Doubler rapidement", "Klaxonner pour prévenir les enfants"],
            correct: 1,
            explanation: "En présence d'un bus scolaire arrêté avec feux de détresse, il faut impérativement ralentir fortement et être prêt à s'arrêter. Des enfants peuvent traverser la route de manière imprévisible."
          },
          {
            id: "q5",
            text: "Les angles morts d'un poids lourd sont principalement situés :",
            options: ["Uniquement derrière le camion", "À l'avant, sur les côtés droite et gauche, et directement derrière", "Seulement sur le côté gauche", "Il n'y a pas d'angles morts avec les rétroviseurs modernes"],
            correct: 1,
            explanation: "Les angles morts d'un poids lourd sont très importants : à l'avant immédiat, sur les deux côtés (surtout le droit), et directement derrière. Ne jamais rester dans ces zones !"
          }
        ]
      }
    ]
  },
  {
    id: 6,
    theme: "Thème 6",
    title: "L'environnement",
    description: "Éco-conduite, pollution, nuisances sonores, stationnement.",
    thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "6-1",
        title: "Vidéo : Éco-conduite et impact environnemental",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplacer
        duration: "11:30",
        description: "Adoptez une conduite responsable pour réduire votre consommation et votre impact sur l'environnement.",
        keyPoints: [
          "L'anticipation est la base de l'éco-conduite : éviter les accélérations et freinages brusques.",
          "Le moteur à froid consomme jusqu'à 30% de carburant supplémentaire.",
          "Les zones à faibles émissions (ZFE) limitent la circulation des véhicules polluants.",
          "Klaxonner est interdit en agglomération sauf en cas de danger immédiat.",
        ]
      },
      {
        id: "6-2",
        title: "Questions d'entraînement : L'environnement",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "La première action de l'éco-conduite est :",
            options: ["Rouler vite puis freiner fort", "Anticiper pour rouler à allure régulière", "Garder le moteur chaud en permanence", "Utiliser le frein moteur le moins possible"],
            correct: 1,
            explanation: "L'anticipation est le premier principe de l'éco-conduite. En anticipant, on évite les accélérations et freinages inutiles, ce qui réduit la consommation de carburant."
          },
          {
            id: "q2",
            text: "En agglomération, l'usage du klaxon est :",
            options: ["Autorisé à tout moment pour prévenir", "Interdit sauf danger immédiat", "Autorisé uniquement la nuit", "Obligatoire avant un carrefour"],
            correct: 1,
            explanation: "En agglomération, l'usage du klaxon est interdit sauf en cas de danger immédiat. Hors agglomération, il peut être utilisé pour prévenir d'un dépassement."
          },
          {
            id: "q3",
            text: "Arrêter son moteur lors d'un arrêt de plus de 30 secondes permet de :",
            options: ["Abîmer le démarreur", "Réduire la consommation et la pollution", "Surchauffer le moteur", "Vider la batterie"],
            correct: 1,
            explanation: "Couper le moteur dès qu'on s'arrête plus de 30 secondes réduit la consommation et les émissions polluantes. Les moteurs modernes résistent parfaitement aux démarrages fréquents."
          },
          {
            id: "q4",
            text: "Le stationnement est interdit :",
            options: ["Uniquement sur les trottoirs", "Devant une entrée carrossable, sur un passage piéton, dans les 5 mètres avant un feu", "Seulement là où il y a un panneau d'interdiction", "Uniquement sur voie rapide"],
            correct: 1,
            explanation: "Le stationnement est interdit dans de nombreux cas réglementés : devant les entrées carrossables, sur les passages piétons, dans les 5 mètres avant un feu tricolore, etc., même sans panneau d'interdiction."
          },
          {
            id: "q5",
            text: "Une zone à faibles émissions (ZFE) :",
            options: ["Interdit toute circulation automobile", "Limite la circulation aux véhicules les moins polluants selon leur vignette Crit'Air", "N'existe qu'en Île-de-France", "Concerne uniquement les poids lourds"],
            correct: 1,
            explanation: "Les ZFE limitent ou interdisent la circulation des véhicules les plus polluants selon leur vignette Crit'Air (de 1 à 5, plus électriques). Plusieurs grandes agglomérations françaises en sont dotées."
          }
        ]
      }
    ]
  },
  {
    id: 7,
    theme: "Thème 7",
    title: "Les accidents de la route",
    description: "Premiers secours, responsabilités, assurance, constat amiable.",
    thumbnail: "https://images.unsplash.com/photo-1590102584921-2f7d65e8a157?w=400&h=225&fit=crop",
    lessons: [
      {
        id: "7-1",
        title: "Vidéo : Gestes qui sauvent et responsabilités",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Remplacer
        duration: "15:00",
        description: "Comment réagir sur les lieux d'un accident ? Premiers secours, alerter les secours, responsabilités civiles et pénales.",
        keyPoints: [
          "En cas d'accident : protéger, alerter, secourir (PAS).",
          "Ne jamais déplacer un blessé sauf danger immédiat.",
          "Le numéro d'urgence européen est le 112.",
          "Ne pas fuir un accident est une obligation légale.",
        ]
      },
      {
        id: "7-2",
        title: "Questions d'entraînement : Les accidents",
        type: "quiz",
        duration: "5 questions",
        questions: [
          {
            id: "q1",
            text: "Vous êtes témoin d'un accident. La première action à effectuer est :",
            options: ["Appeler les secours immédiatement", "Protéger les lieux pour éviter un suraccident", "Porter secours aux blessés", "Prendre des photos"],
            correct: 1,
            explanation: "La règle PAS : Protéger d'abord (baliser, feux de détresse), puis Alerter (appeler le 15, 17, 18 ou 112), puis Secourir. Sans protection, les secouristes eux-mêmes risquent d'être victimes."
          },
          {
            id: "q2",
            text: "Un blessé est inconscient mais respire. Vous devez :",
            options: ["Le laisser dans sa position", "Le mettre en position latérale de sécurité (PLS)", "Commencer un massage cardiaque", "Lui donner à boire"],
            correct: 1,
            explanation: "Un blessé inconscient qui respire doit être mis en Position Latérale de Sécurité (PLS) pour éviter l'asphyxie en cas de vomissement, sauf suspicion de traumatisme cervical."
          },
          {
            id: "q3",
            text: "Le numéro européen d'urgence joignable depuis n'importe quel téléphone, même sans crédit, est :",
            options: ["15 (SAMU)", "17 (Police)", "18 (Pompiers)", "112"],
            correct: 3,
            explanation: "Le 112 est le numéro d'urgence européen, accessible depuis n'importe quel téléphone mobile même sans carte SIM ni crédit. Il centralise tous les services d'urgence."
          },
          {
            id: "q4",
            text: "Fuir après avoir causé un accident est :",
            options: ["Une infraction mineure", "Un délit de fuite puni d'une peine de prison et d'un retrait de points", "Autorisé si personne n'est blessé", "Seulement punissable si vous êtes identifié"],
            correct: 1,
            explanation: "Le délit de fuite est une infraction grave punissable de 3 ans d'emprisonnement, 75 000€ d'amende, et un retrait de 6 points sur le permis, même si vous n'êtes pas responsable de l'accident."
          },
          {
            id: "q5",
            text: "En cas d'accident sans blessé, vous devez :",
            options: ["Repartir si les dégâts sont minimes", "Remplir un constat amiable avec l'autre conducteur", "Appeler la police systématiquement", "Payer le dédommagement en espèces sur place"],
            correct: 1,
            explanation: "En cas d'accident matériel sans blessé, les conducteurs impliqués doivent remplir un constat amiable. Ce document est essentiel pour le traitement par les assurances."
          }
        ]
      }
    ]
  }
]

// Obtenir toutes les leçons à plat
export function getAllLessons() {
  return COURSES.flatMap(course =>
    course.lessons.map(lesson => ({ ...lesson, courseId: course.id, courseTitle: course.title }))
  )
}

// Obtenir une leçon par courseId et lessonId
export function getLesson(courseId, lessonId) {
  const course = COURSES.find(c => c.id === Number(courseId))
  if (!course) return null
  const lesson = course.lessons.find(l => l.id === lessonId)
  if (!lesson) return null
  return { lesson, course }
}

// Obtenir la leçon suivante
export function getNextLesson(courseId, lessonId) {
  const allLessons = getAllLessons()
  const currentIndex = allLessons.findIndex(l => l.courseId === Number(courseId) && l.id === lessonId)
  return allLessons[currentIndex + 1] || null
}
