<template>
	<view class="app-tabbar-wrap">
		<view class="tabbar-box">
			<view class="tabbar-item">
			<button class="btn1" @tap.stop="onWar('成功入库2件商品')">入库V8</button>
			<button class="btn2" @tap.stop="onWar('已确认收货2件商品')">确认收货</button>
			</view>
		</view>
	</view>
</template>

<script>
import { mapMutations, mapActions, mapState, mapGetters } from 'vuex';
export default {
	name: 'appTabbar',
	components: {},
	data() {
		return {};
	},
	props: {
		queryObj: {}
	},
	computed: {
		...mapState({
			templateData: state => state.init.templateData.tabbar,
			cartNum: state => state.cart.cartNum
		}),
		tabbarData() {
			if (this.templateData) {
				return this.templateData[0].content;
			}
		},
		tabbarList() {
			if (this.tabbarData) {
				return this.tabbarData.list;
			}
		},
		currentPath() {
			let pages = getCurrentPages();
			let query = this.queryObj ? this.queryObj : {};
			let currPage = null;
			if (pages.length) {
				currPage = pages[pages.length - 1].route;
			}
			if (Object.keys(query).length) {
				let params = '';
				for (let key in query) {
					params += '?' + key + '=' + query[key] + '&';
				}
				params = params.substring(0, params.length - 1);
				return '/' + currPage + params;
			}
			return '/' + currPage;
		},
		showTabbar() {
			if (this.tabbarData && this.tabbarData.list) {
				let arr = [];
				let path = '';
				arr.push('/pages/index/index');
				for (let item of this.tabbarData.list) {
					arr.push(item.path);
				}
				return arr.includes(this.currentPath);
			}
		}
	},
	created() {},
	methods: {
		onWar(msg){
			var that = this
			uni.showToast({
				icon: 'none',
				title: msg
			})
			setTimeout(() => {
				that.$Router.back();
			}, 1000);
		},
		// 切换tabbar
		switchTabbar(tab, index) {
			console.log(tab)
			
			this.$tools.routerTo(tab.path, {}, true);
		}
	}
};
</script>

<style lang="scss">
.app-tabbar-wrap {
	height: calc(120rpx + env(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	position: relative;
	width: 100%;
	z-index: 70;

	.tabbar-box {
		position: fixed;
		display: flex;
		align-items: center;
		width: 100%;
		height: calc(120rpx + env(safe-area-inset-bottom) / 2);
		border-top: 1rpx solid #eeeeee;
		background-color: #fff;
		z-index: 998;
		bottom: 0;
		padding-bottom: calc(env(safe-area-inset-bottom) / 2);

		.tabbar-item {
			height: 100%;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			flex: 1;
			.btn1{
				width: 250rpx;
				border-radius: 40rpx;
				color: white;
				background-color: #10C1B3;
				font-size: 32rpx;
			}
			.btn2{
				width: 250rpx;
				border-radius: 40rpx;
				color: white;
				background-color: #3D7DF2;
				font-size: 32rpx;
			}
		
		}
	}
}
</style>
