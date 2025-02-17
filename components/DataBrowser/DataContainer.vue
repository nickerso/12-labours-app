<template>
  <div>
    <span v-if="$route.query.type === 'dataset'">
      <SearchData v-on:searchContent="updateSearch" />
      <div class="data-container">
        <div>
          <FilterData
            v-on:filter-facet="updateFilterFacet"
            v-on:relation="updateRelation"
          />
        </div>
        <div>
          <PaginationTool
            v-if="totalCount >= 0"
            :totalCount="totalCount"
            v-on:page-limit="updatePageLimit"
            v-on:order="updateOrder"
          />
          <DisplayData
            v-loading="isLoading"
            element-loading-text="Loading..."
            element-loading-spinner="el-icon-loading"
            :dataDetails="currentData"
            :totalCount="totalCount"
          />
          <PaginationTool
            v-if="totalCount >= 0"
            :totalCount="totalCount"
            v-on:page-limit="updatePageLimit"
            v-on:order="updateOrder"
          />
        </div>
      </div>
    </span>

    <!-- display tools -->
    <span v-if="$route.query.type === 'tools'">
      <SearchData />
      <div class="data-container">
        <FilterData />
      </div>
    </span>

    <!-- display news -->
    <span v-if="$route.query.type === 'news'">
      <SearchData />
      <div class="data-container">
        <FilterData />
      </div>
    </span>

    <!-- display laboursInfo -->
    <span v-if="$route.query.type === 'laboursInfo'">
      <SearchData />
      <div class="data-container">
        <FilterData />
      </div>
    </span>

    <!-- display workflows -->
    <span v-if="$route.query.type === 'workflows'">
      <SearchData />
      <div class="data-container">
        <FilterData />
      </div>
    </span>

    <!-- display dashboard -->
    <span v-if="$route.query.type === 'dashboard'">
      <!-- <SearchData />
      <div class="data-container">
        <FilterData />
      </div> -->
      <br />
      <dashboard
        :user="user"
        :table_data="table_data"
        :columns_list="columns_list"
        :default_columns="selected_columns"
        v-on:open-page="showPage"
      />
    </span>
  </div>
</template>

<script>
import backendQuery from "@/services/backendQuery";
import PaginationTool from "./PaginationTool.vue";
import SearchData from "./SearchData.vue";
import FilterData from "./FilterData.vue";
import DisplayData from "./DisplayData.vue";

export default {
  components: {
    PaginationTool,
    SearchData,
    FilterData,
    DisplayData,
  },
  props: ["category"],
  data: () => {
    return {
      isLoading: true,
      totalCount: -1,
      currentData: [],
      pageNumber: -1,
      limitNumber: -1,
      facetList: [],
      filterDict: {},
      searchContent: "",
      relationAND: true,
      currentOrder: "Published(asc)",
      table_data: [
        {
          workflow: 'Cardiac',
          subject: 'Patient 1',
          progress: 'Step 4/5',
          time: '1.5 mins',
          age: '40',
          height: '170',
          logs: 'Link'
        },
        {
          workflow: 'Shoulder',
          subject: 'Patient 1',
          progress: 'Finished',
          time: '60 mins',
          age: '50',
          height: '160',
          logs: 'Link'
        },
        {
          workflow: 'Shoulder',
          subject: 'Patient 2',
          progress: 'Step 2/3',
          time: '150 mins',
          age: '60',
          height: '150',
          logs: 'Link'
        },
      ],
      selected_columns: ['Workflow', 'Subject ID', 'Progress', 'Actions'],
    };
  },

  created: function() {
    // set exist url queries to corresponding data
    // for future data change check
    if (this.$route.query.search) {
      this.searchContent = this.$route.query.search;
    }
    if (this.$route.query.order) {
      this.currentOrder = this.$route.query.order;
    }
    if (this.$route.query.facets) {
      this.facetList = this.$route.query.facets.split(",");
      this.relationAND = this.$route.query.relation === "and" ? true : false;
    } else {
      this.fetchData();
    }
  },

  computed: {
    user: function() {
      return this.$auth.user;
    },
    columns_list: function() {
      if (this.user && this.user.type_name && this.user.type_name === 'Researcher')
        return ['Workflow', 'Subject ID', 'Progress', 'Time', 'Age', 'Height', 'Logs', 'Actions'];
      else
        return ['Workflow', 'Subject ID', 'Progress', 'Time', 'Age', 'Height', 'Actions'];
    },
  },

  watch: {
    "$route.query": {
      handler() {
        this.fetchData();
      },
    },
  },

  methods: {
    async fetchData() {
      this.isLoading = true;
      const result = await backendQuery.fetchPaginationData(
        this.$config.query_api_url,
        this.filterDict,
        this.$route.query.limit,
        this.$route.query.page,
        this.searchContent,
        this.relationAND ? "and" : "or",
        this.currentOrder
      );
      this.currentData = result["items"];
      this.totalCount = result["total"];
      this.isLoading = false;
    },

    compareFilter(oldFilter, oldFilterLength, newFilter, newFilterLength) {
      let isDifferent = false;
      if (newFilterLength !== oldFilterLength) {
        isDifferent = true;
      } else {
        const greaterEqualFilter =
          newFilterLength <= oldFilterLength ? oldFilter : newFilter;
        const lessFilter =
          newFilterLength > oldFilterLength ? oldFilter : newFilter;
        for (const key in greaterEqualFilter) {
          if (key in lessFilter) {
            if (lessFilter[key].length !== greaterEqualFilter[key].length) {
              isDifferent = true;
            }
          } else {
            isDifferent = true;
          }
        }
      }
      return isDifferent;
    },

    compareFacet(oldFacet, newFacet) {
      if (newFacet.length !== oldFacet.length) {
        return true;
      }
      return false;
    },

    updateFilterFacet(filterVal, facetVal) {
      const currentFilterLength = Object.keys(this.filterDict).length;
      const incomingFilterLength = Object.keys(filterVal).length;
      const isRefreshWithFacet =
        currentFilterLength === 0 && this.facetList.length !== 0;
      const isFilterChanged = this.compareFilter(
        this.filterDict,
        currentFilterLength,
        filterVal,
        incomingFilterLength
      );
      const isFacetChanged = this.compareFacet(this.facetList, facetVal);
      if (isFilterChanged || isFacetChanged) {
        this.filterDict = JSON.parse(JSON.stringify(filterVal));
        this.facetList = facetVal;
        this.updateURL(isRefreshWithFacet ? this.$route.query.page : 1);
        // url query not change, cannot trigger watch
        // force fetch
        if (isRefreshWithFacet) {
          this.fetchData();
        }
      }
    },

    updateRelation(val) {
      const isRelationChanged = this.relationAND !== val;
      if (isRelationChanged) {
        this.relationAND = val;
        this.updateURL(1);
      }
    },

    updateSearch(val) {
      const isSearchChanged = this.searchContent !== val;
      if (isSearchChanged) {
        this.searchContent = val;
        this.updateURL(1);
      }
    },

    updatePageLimit(pageVal, limitVal) {
      const isPageChanged = this.pageNumber !== pageVal;
      const isLimitChanged = this.limitNumber !== limitVal;
      if (isPageChanged || isLimitChanged) {
        this.pageNumber = pageVal;
        this.limitNumber = limitVal;
        this.updateURL(pageVal, limitVal);
      }
    },

    updateOrder(val) {
      const isOrderChanged = this.currentOrder !== val;
      if (isOrderChanged) {
        this.currentOrder = val;
        this.updateURL(1);
      }
    },

    updateURL(page = this.$route.query.page, limit = this.$route.query.limit) {
      let query = {
        type: this.$route.query.type,
        page: page,
        limit: limit,
      };

      if (this.facetList.length > 0) {
        query.facets = this.facetList.toString();
        query.relation = this.relationAND ? "and" : "or";
      }
      if (this.searchContent !== "") {
        query.search = this.searchContent;
      }
      if (this.currentOrder !== "Published(asc)") {
        query.order = this.currentOrder;
      }
      this.$router.push({
        path: this.$route.path,
        query: query,
      });
    },

    showPage(val) {
      let route;
      if (val.includes('Workflow')) {
        route = this.$router.resolve({
          name: `data-browser-workflow`,
          query: { model: val.slice(9) },
        });
      } else {
        route = this.$router.resolve({
          name: `data-browser-dataset-id`,
          params: { id: 'dataset-102-version-4' },
          query: { datasetTab: 'abstract' },
        });
      }
      window.open(route.href, '_self');
    }
  },
};
</script>

<style scoped lang="scss">
.data-container {
  min-width: 15rem;
  gap: 2rem;

  @media only screen and (min-width: $viewport-sm) {
    display: flex;
  }

  @media only screen and (max-width: $viewport-md) {
    gap: 1rem;
  }
}
</style>
