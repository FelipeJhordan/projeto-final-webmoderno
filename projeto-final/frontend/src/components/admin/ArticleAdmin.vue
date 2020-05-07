<template>
 <div class="article-admin">
        <b-form>
            <input type="hidden" v-model="article.id" id="article-id">
            <b-row>
                <b-col  xs="12">
                    <b-form-group label="Nome:" label-for="article-name">
                        <b-form-input id="article-name" type="text" 
                        v-model="article.name" :readonly="mode === 'remove'" required placeholder="Informe o Nome do Artigo">
                        </b-form-input>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col  xs="12">
                    <b-form-group label="Descrição:" label-for="article-description">
                        <b-form-input id="article-description" type="text" 
                        v-model="article.description" :readonly="mode === 'remove'" required placeholder="Informe a Descrição do Artigo">
                        </b-form-input>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col  xs="12">
                    <b-form-group v-if="mode === 'save'" label="Imagem (URL):" label-for="article-imageUrl">
                        <b-form-input id="article-imageUrl" type="text" 
                        v-model="article.imageUrl" :readonly="mode === 'remove'" required placeholder="Informe a URL da Imagem">
                        </b-form-input>
                    </b-form-group>
                </b-col>
            </b-row>
              <b-row>
                <b-col  xs="12">
                    <b-form-group v-if="mode === 'save'" label="Categoria:" label-for="article-categoryId">
                       <b-form-select  id="category-categoryId" :options="categories" v-model="article.categoryId"/>
                    </b-form-group>
                </b-col>
            </b-row>
              <b-row>
                <b-col  xs="12">
                    <b-form-group v-if="mode === 'save'" label="Autor:" label-for="article-userId">
                       <b-form-select  id="category-userId" :options="users" v-model="article.userId"/>
                    </b-form-group>
                </b-col>
            </b-row>
             <b-row>
                <b-col  xs="12">
                    <b-form-group v-if="mode === 'save'" label="Conteúdo:" label-for="category-content">
                      <VueEditor v-model="article.content" placeholder="Informe o conteúdo do Artigo..."/>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col xs="12" class="ml-3">
                     <b-button variant="primary" v-if="mode === 'save'" @click="save">Salvar</b-button>
                     <b-button variant="danger" v-if="mode === 'remove'" @click="remove">Excluir</b-button>
                     <b-button class="ml-2" @click="reset">Cancelar</b-button>
                </b-col>
           </b-row>
        </b-form>
        <hr>
        <b-table hover striped :items="articles" :fields="fields">
            <template slot="cell(actions)" slot-scope="data">
                <b-button variant="warning" @click="loadArticle(data.item)" class="mr-2"><i class="fa fa-pencil"></i></b-button>
                <b-button variant="danger" @click="loadArticle(data.item,'remove')"><i class="fa fa-trash"></i></b-button>
            </template>
        </b-table>
        <b-pagination size="md" v-model="page" :total-rows="count" :per-page="limit" />
    </div>
</template>
<script>
import {baseApiUrl, showError } from '@/global'
import axios from 'axios'
import { VueEditor } from 'vue2-editor'
import 'highlightjs/styles/dracula.css'
import hljs from 'highlightjs/highlight.pack.js'
export default {
    name: 'articleAdmin',
    components: { VueEditor },
    data: function(){
        return { 
            mode: 'save',
            article: {},
            articles: [],
            categories: [],
            users: [],
            page: 1,
            limit: 0,
            count: 0,
            fields: [
                { key: 'id', label: 'Código', sortable: true},
                { key: 'name', label: 'Nome'},
                { key: 'description', label: 'Descrição'},
                { key: 'actions', label: 'Ações'}
            ]
        }
    },
    methods: {
        loadArticles() {
            const url = `${baseApiUrl}/articles?page=${this.page}`
            axios.get(url).then( 
              res => {
                this.articles = res.data.data
                this.count = res.data.count
                this.limit = res.data.limitRows
              }
            )
        },
        reset() {
            this.mode = 'save'
            this.article = {}
            this.loadArticles()
        },
        save() {
            const method = this.article.id ? 'put' : 'post'
            const  id = this.article.id ? `/${this.article.id}` : ''
            axios[method](`${baseApiUrl}/articles${id}`, this.article)
                .then( () => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        remove() {
            const id = this.article.id
            axios.delete(`${baseApiUrl}/articles/${id}`)
                .then( () => {
                    this.$toasted.global.defaultSuccess()
                    this.reset()
                })
                .catch(showError)
        },
        loadArticle(article, mode = 'save') {
            this.mode = mode
            //this.article = { ...article}
            axios.get(`${baseApiUrl}/articles/${article.id}`)
              .then(res => this.article = res.data)
        },
        loadCategories() {
          const url = `${baseApiUrl}/categories`
          axios.get(url).then(res => { 
            this.categories = res.data.map( category => {
              return { value: category.id, text: category.path}
            })
          })
        },
        loadUsers() {
          const url = `${baseApiUrl}/users`
          axios.get(url).then( res => { 
            this.users = res.data.map( user => { 
              return { value: user.id, text: `${user.name} - ${user.email}`}
            })
          })
        }
    },
    watch:{
        page() {
          this.loadArticles()
        }
    },
    mounted() {
        this.loadCategories()
        this.loadArticles()
        this.loadUsers()
    }
}
</script>

<style>
    hr {   
        height: 3px;
        border: 5px white;
    }
</style>