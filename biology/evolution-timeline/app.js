const sharedAncestors = [
    { name: "First Bacterium (LUCA)", time: "3.8 Billion Years Ago", desc: "The Last Universal Common Ancestor. A single-celled prokaryote marking the origin of life.", etymology: "From Greek 'bakterion' meaning 'little stick'.", image: "images/shared_1_bacterium_1779704401539.png" },
    { name: "Early Eukaryote", time: "2 Billion Years Ago", desc: "A more complex cell with a distinct nucleus and membrane-bound organelles.", etymology: "From Greek 'eu' (true) and 'karyon' (nut or kernel, referring to the nucleus).", image: "images/shared_2_eukaryote_1779704416021.png" },
    { name: "Early Metazoan", time: "600 Million Years Ago", desc: "Primitive multicellular organisms, resembling simple sea sponges, living in ancient oceans.", etymology: "From Greek 'meta' (after/beyond) and 'zoon' (animal).", image: "images/shared_3_metazoan_1779704430656.png" },
    { name: "Early Chordate (Pikaia)", time: "530 Million Years Ago", desc: "One of the first creatures to develop a primitive notochord, the precursor to a spine.", etymology: "Named after Mount Pika in British Columbia, Canada.", image: "images/shared_4_chordate_1779704446396.png" },
    { name: "Jawless Fish (Ostracoderm)", time: "500 Million Years Ago", desc: "Early fish with armored plates but no jaw, navigating the Cambrian seas.", etymology: "From Greek 'ostrakon' (shell) and 'derma' (skin).", image: "images/shared_5_jawless_fish_1779704462207.png" },
    { name: "Jawed Fish (Placoderm)", time: "420 Million Years Ago", desc: "The evolution of jaws allowed these armored fish to become formidable predators.", etymology: "From Greek 'plax' (plate) and 'derma' (skin).", image: "images/shared_6_placoderm_1779704475687.png" },
    { name: "Lobe-finned Fish", time: "385 Million Years Ago", desc: "Fish that developed sturdy, fleshy fins which would eventually evolve into limbs.", etymology: "Also called Sarcopterygii, from Greek 'sarx' (flesh) and 'pteryx' (fin/wing).", image: "images/shared_7_lobe_finned_1779704491003.png" },
    { name: "Tiktaalik (The Fishapod)", time: "375 Million Years Ago", desc: "A crucial transitional fossil with limb-like fins, a neck, and the ability to prop itself up in shallow water.", etymology: "From Inuktitut 'tiktaalik' meaning 'large freshwater fish'.", image: "images/shared_8_tiktaalik_1779704503935.png" },
    { name: "Early Tetrapod (Acanthostega)", time: "365 Million Years Ago", desc: "One of the first vertebrates to possess true limbs with digits, though still largely aquatic.", etymology: "From Greek 'akantha' (spine/thorn) and 'stega' (roof).", image: "images/shared_9_tetrapod_1779704518598.png" },
    { name: "Early Amniote (Casineria)", time: "315 Million Years Ago", desc: "Evolution of the amniotic egg allowed these early reptile-like creatures to reproduce on dry land.", etymology: "Latinized name after Cheese Bay, Scotland, where it was discovered.", image: "images/shared_10_amniote_1779704533314.png" }
];

const synapsidAncestors = [
    { name: "Early Synapsid (Dimetrodon)", time: "300 Million Years Ago", desc: "Often mistaken for a dinosaur, this was an early mammal-like reptile, some sporting large sails.", etymology: "From Greek 'di' (two), 'metron' (measure), and 'odon' (tooth).", image: "images/synapsid_1_synapsid.png" },
    { name: "Therapsid", time: "260 Million Years Ago", desc: "Advanced synapsids showing early mammalian traits like specialized teeth and limbs positioned under the body.", etymology: "From Greek 'ther' (beast) and 'apsis' (arch).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Therapsida_3.jpg/960px-Therapsida_3.jpg" },
    { name: "Morganucodon", time: "200 Million Years Ago", desc: "A tiny, shrew-like creature representing one of the earliest true mammals, living in the shadows of dinosaurs.", etymology: "Named after Glamorgan (Wales) and Greek 'odon' (tooth).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Restored_skull_of_Morganucodon_oehleri.jpg/960px-Restored_skull_of_Morganucodon_oehleri.jpg" },
    { name: "Juramaia", time: "160 Million Years Ago", desc: "The earliest known ancestor of placental mammals, a small tree-dwelling creature.", etymology: "Meaning 'Jurassic mother', from Jurassic + Greek 'maia' (mother).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Juramaia_sinensis_Holotype_NNHM.jpg/960px-Juramaia_sinensis_Holotype_NNHM.jpg" }
];

const evolutionData = {
    horse: [
        ...sharedAncestors,
        ...synapsidAncestors,
        { name: "Early Ungulate (Phenacodontid)", time: "65 Million Years Ago", desc: "A small, early hoofed mammal that emerged after the dinosaur extinction.", etymology: "From Greek 'phenax' (deceiver/cheat) and 'odon' (tooth).", image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Phenacodus.jpg" },
        { name: "Eohippus (Hyracotherium)", time: "55 Million Years Ago", desc: "The 'dawn horse'. A small, dog-sized forest dweller with multi-toed feet.", etymology: "Eohippus means 'Dawn horse' (Greek 'eos' + 'hippos'). Hyracotherium means 'Hyrax-like beast'.", image: "images/horse_1_eohippus.png" },
        { name: "Merychippus", time: "17 Million Years Ago", desc: "Adapted to expanding grasslands with high-crowned teeth and legs suited for running.", etymology: "From Greek 'meryx' (ruminant) and 'hippos' (horse).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Merychippus_skeletal_reconstruction.png/960px-Merychippus_skeletal_reconstruction.png" },
        { name: "Equus (Modern Horse)", time: "5 Million Years Ago - Present", desc: "The modern genus. Large size, single-toed hooves, and highly specialized teeth.", etymology: "From Latin 'equus' meaning 'horse'.", image: "images/horse_5_equus.png" }
    ],
    human: [
        ...sharedAncestors,
        ...synapsidAncestors,
        { name: "Early Primate (Purgatorius)", time: "65 Million Years Ago", desc: "One of the earliest primates, adapting to life in the trees with grasping hands.", etymology: "Named after Purgatory Hill in Montana, USA.", image: "https://upload.wikimedia.org/wikipedia/commons/8/82/Purgatorius_BW.jpg" },
        { name: "Early Ape (Proconsul)", time: "20 Million Years Ago", desc: "An early hominoid living in the forests of Africa, lacking a tail.", etymology: "From Latin 'pro' (before) and 'Consul' (named after a famous captive chimp named Consul).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Proconsul_africanus_skull.jpg/800px-Proconsul_africanus_skull.jpg" },
        { name: "Australopithecus afarensis", time: "3.9 - 2.9 Million Years Ago", desc: "Fully bipedal but retained some ape-like features. Famous example: 'Lucy'.", etymology: "From Latin 'australis' (southern) and Greek 'pithekos' (ape).", image: "images/human_3_australopithecus.png" },
        { name: "Homo sapiens", time: "300,000 Years Ago - Present", desc: "Anatomically modern humans, characterized by a large, complex brain and culture.", etymology: "From Latin 'homo' (man) and 'sapiens' (wise).", image: "images/human_6_sapiens.png" }
    ],
    eagle: [
        ...sharedAncestors,
        { name: "Early Archosaur", time: "250 Million Years Ago", desc: "The ruling reptiles, diverging from the synapsids. Ancestors to both crocodiles and dinosaurs.", etymology: "From Greek 'archos' (ruling) and 'sauros' (lizard).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Euparkeria_capensis_type_bonebed.png/960px-Euparkeria_capensis_type_bonebed.png" },
        { name: "Theropod Dinosaur", time: "230 - 66 Million Years Ago", desc: "Small, feathered theropod dinosaurs are the direct ancestors of all modern birds.", etymology: "From Greek 'ther' (beast) and 'pous' (foot).", image: "images/eagle_1_theropod.png" },
        { name: "Early Bird (Archaeopteryx)", time: "150 Million Years Ago", desc: "A crucial transitional fossil showing both dinosaurian traits and fully formed flight feathers.", etymology: "From Greek 'archaios' (ancient) and 'pteryx' (feather/wing).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Archaeopteryx_lithographica_%28Berlin_specimen%29.jpg/960px-Archaeopteryx_lithographica_%28Berlin_specimen%29.jpg" },
        { name: "Early Accipitriform", time: "62 Million Years Ago", desc: "The lineage leading to modern hawks, eagles, and kites, diverging after the mass extinction.", etymology: "From Latin 'accipiter' (hawk) and 'forma' (shape).", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/%D7%93%D7%95%D7%A8%D7%A1%D7%99-%D7%99%D7%95%D7%9D-01.jpg/960px-%D7%93%D7%95%D7%A8%D7%A1%D7%99-%D7%99%D7%95%D7%9D-01.jpg" },
        { name: "Bald Eagle (Haliaeetus leucocephalus)", time: "1 Million Years Ago - Present", desc: "The modern bald eagle, characterized by its specialized feet for grasping slippery fish.", etymology: "From Greek 'haliaetos' (sea eagle), 'leukos' (white), and 'kephale' (head).", image: "images/eagle_4_baldeagle.png" }
    ]
};

const selectElement = document.getElementById('animal-select');
const timelineContainer = document.getElementById('timeline-container');

selectElement.addEventListener('change', (e) => {
    const selectedAnimal = e.target.value;
    if (selectedAnimal && evolutionData[selectedAnimal]) {
        renderTimeline(evolutionData[selectedAnimal]);
    }
});

function renderTimeline(data) {
    timelineContainer.style.opacity = 0;
    
    setTimeout(() => {
        timelineContainer.innerHTML = '';
        
        data.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            timelineItem.innerHTML = `
                <div class="timeline-content" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(item.name)}', '_blank')" style="cursor: pointer;" title="Click to search on Google">
                    <img src="${item.image}" alt="${item.name}" class="timeline-image" onerror="this.src='https://via.placeholder.com/400x250/1e293b/3b82f6?text=Image+Missing'">
                    <span class="timeline-date">${item.time}</span>
                    <h2 class="timeline-title">${item.name}</h2>
                    <p class="timeline-etymology"><strong>Etymology:</strong> ${item.etymology}</p>
                    <p class="timeline-desc">${item.desc}</p>
                </div>
            `;
            timelineContainer.appendChild(timelineItem);
        });

        timelineContainer.classList.remove('hidden');
        timelineContainer.style.opacity = 1;

        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200 + 100);
        });
    }, 300);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });
