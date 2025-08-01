const fs = require('fs').promises;

async function useSingleFileAuthState(filePath) {
  let state;

  try {
    const data = await fs.readFile(filePath, 'utf8');
    state = JSON.parse(data);
  } catch (error) {
    console.log('⚠️ No se encontró archivo de credenciales');
    return { state: {}, saveState: () => {} }; // estado inicial vacío
  }

  async function saveState(newState) {
    if (!newState) return;
    try {
      await fs.writeFile(filePath, JSON.stringify({ ...state, ...newState }, null, 2), 'utf8');
    } catch (error) {
      console.error('❌ Error al guardar estado:', error);
    }
  }

  return { state, saveState };
}

module.exports = { useSingleFileAuthState };
