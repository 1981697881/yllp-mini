<template>
	<view class="search x-c" :style="{ 'background-color': bgcolor }" :class="{ active: bgcolor }">
		<view class="action text-white" @tap="jump('', city)">
			<text>{{city.cityName}}</text>
			<text class="cuIcon-triangledownfill"></text>
		</view>
		<view class="search-box x-c app-selector-rect" @tap="jump('/pages/goods/list', { keywords: detail.content })">
			<text class="cuIcon-search"></text>
			<text class="search-val">{{ detail.content || '暂无数据' }}</text>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
export default {
	components: {},
	data() {
		return {};
	},
	props: {
		detail: {
			type: Object,
			default: null
		},
		bgcolor: {
			type: String,
			default: '#FFFFFF'
		}
	},
	computed: {
		...mapState({
			city: state => state.init.city
		})
	},
	onLoad(){
	},
	methods: { 
		jump(path, params) {
			this.$Router.push({
				path: path,
				params: params
			});
		}
	}
};
</script>

<style lang="scss">
.active {
	transition: all linear 0.3s;
}
.search {
	height: 100rpx;
	width: 750rpx;
	background: #fff;
	transition: all linear 0.3s;
}

.search-box {
	height: 64rpx;
	width: 600rpx;
	background: #f5f5f5;
	border-radius: 10rpx;

	.cuIcon-search {
		font-size: 36rpx;
		margin-right: 20rpx;
	}

	.search-val {
		font-size: 30rpx;
	}
}
</style>
