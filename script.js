// Susunan pulau ikut trek adventure
const pulauOrder = [
  "pulau-nombor",
  "pulau-tambah",
  "pulau-tolak",
  "pulau-darab",
  "pulau-bahagi",
  "pulau-pecahan",
  "pulau-masa",
  "pulau-wang"
];

// Fungsi untuk unlock pulau
function unlockPulau(id) {
  // buang status active dari semua pulau
  document.querySelectorAll('.pulau').forEach(p => p.classList.remove('active'));

  // buka pulau baru
  const pulau = document.getElementById(id);
  pulau.classList.remove('locked');
  pulau.classList.add('active');

  // padlock hilang bila unlock
  const padlock = pulau.querySelector('.padlock');
  if (padlock) padlock.style.display = 'none';
}

// Flow automatik: klik pulau active → buka pulau seterusnya
pulauOrder.forEach((id, index) => {
  const pulau = document.getElementById(id);
  if (pulau) {
    pulau.addEventListener("click", () => {
      // hanya boleh klik pulau active
      if (pulau.classList.contains("active")) {
        const nextId = pulauOrder[index + 1];
        if (nextId) unlockPulau(nextId);
      }
    });
  }
});
