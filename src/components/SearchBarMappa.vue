<template>
  <div class="search-bar">
    <input
        type="text"
        v-model="searchQuery"
        placeholder="Cerca punti di interesse..."
        @input="onSearch"
    />
    <div v-if="results.length > 0" class="search-results">
      <ul>
        <li v-for="result in results" :key="result.id" @click="selectPOI(result)">
          {{ result.nome }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import API from '@/utils/API';

export default defineComponent({
  name: 'SearchBar',
  emits: ['select-poi'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const results = ref<any[]>([]);
    const allPOIs = ref<any[]>([]);

    const fetchPOIs = async () => {
      try {
        allPOIs.value = await API.getPuntiDiInteresse();
      } catch (error) {
        console.error('Errore nel caricamento dei punti di interesse:', error);
      }
    };

    const onSearch = () => {
      if (!searchQuery.value.trim()) {
        results.value = [];
        return;
      }

      const query = searchQuery.value.toLowerCase();
      results.value = allPOIs.value.filter(poi =>
          poi.nome.toLowerCase().includes(query)
      );
    };

    const selectPOI = (poi: any) => {
      emit('select-poi', poi);
      searchQuery.value = '';
      results.value = [];
    };

    // Carica i POI all'inizializzazione
    fetchPOIs();

    return {
      searchQuery,
      results,
      onSearch,
      selectPOI
    };
  }
});
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 400px;
  z-index: 1000;
  margin: 0 auto;
}

input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #000000;
  border: 1px solid #ccc;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 8px 12px;
  cursor: pointer;
}

li:hover {
  background-color: #f5f5f5;
}
</style>