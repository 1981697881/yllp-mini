<template>
	<view class="page_box">
		<!-- 空白页 -->
		<app-empty v-if="!hasTemplate" :emptyData="emptyData"></app-empty>
		<view v-else class="page_box app-selector">
			<!-- 导航栏 -->
			<view class="head_box active" :style="{ background: bgcolor }">
				<cu-custom :isBack="true" v-if="info && info.name">
					<block slot="content">
						<text class="nav-title app-selector-rect text-black">{{ info.name || '有乐门店管理系统' }}</text>
					</block>
				</cu-custom>
			</view>
			<view class="content_box" style="margin-top: -4rpx;overflow: hidden;">
				<view class="content-box" style="background-color: azure;">
					<view class="cont-tier flex flex-wrap" :class="userInfo.length>0 && userInfo[4] !=''?'justify-between':'justify-end'">
						<view class="tier-left" v-if="userInfo.length>0 && userInfo[4] !=''" @tap.stop="jump('/pages/user/info', {})">
							<image src="/static/user.png"
								mode="aspectFill"></image>
						</view>
						<view class="tier-center" :style="userInfo[2]?'width:400rpx':'width:580rpx'" v-if="userInfo.length>0 && userInfo[4] !=''">
							<view class="text-xl cent-name">用户:{{userInfo[1]}}<text class="text-sm manage-name">{{userInfo[2]?'管理员':'普通用户'}}</text></view>
							<view class="cent-tip">{{userInfo[0]}}</view>
						</view>
						<view class="tier-right">
							<button v-if="userInfo.length>0 && userInfo[4] !=''&& userInfo[2]" class="cu-btn text-white radius" @tap.stop="jump('/pages/index/wallet', {})"><text class="iconfont icon-add-fill">员工管理<text
										class="cuIcon-right"></text></text></button>
							<button v-else-if="userInfo.length==0 || typeof(this.userInfo[4]) == 'undefined' || this.userInfo[4]==''" class="cu-btn text-white radius" @tap.stop="jump('/pages/user/wallet/bind-bank', {})"><text class="iconfont icon-add-fill">绑定用户<text
										class="cuIcon-profile"></text></text></button>
						</view>
					</view>
				</view>
				<scroll-view class="scroll-box padding-sm" scroll-y scroll-with-animation enable-back-to-top>
					<block v-if="template" v-for="(item, index) in template" :key="index">
						<!-- 轮播 -->
						<sh-banner v-if="item.type === 'banner'" :detail="item.content" @tap="jumpToMiniProgram"></sh-banner>
					</block>
					<view class="content-box">
						<view class="box-head bg-white flex flex-wrap justify-between align-center">
							<view class="box-left">
								<image src="https://i.postimg.cc/MpkDtHH3/wetu.png" mode="aspectFill"></image><text
									style="float: right;" class="text-xl text-bold">待收货({{goodsList.length}})</text>
							</view>
							<view class="box-right" @tap.stop="jump('/pages/app/coupon/list', {})">订单列表<text class="cuIcon-right text-gray"></text></view>
						</view>
					</view>
					<scroll-view :style="{ height: hHeight + 'px' }" class="scroll-box bg-white" scroll-y
						enable-back-to-top scroll-with-animation >
						<view class="content-box">
							<view class="goods-list x-f">
								<view class="goods-item" v-for="(goods, index) in goodsList" :key="index" @tap="toCouponDetail(goods)">
									<fz-circuit-meal :detail="goods"
										:isTag="true"></fz-circuit-meal>
								</view>
							</view>
							<!-- 加载更多 -->
							<view v-if="goodsList.length" class="cu-load text-gray" :class="loadStatus"></view>
							<!-- load -->
							<app-load v-model="isLoading"></app-load>
						</view>
						<!-- 功能标题 -->
						<!-- <sh-title-card></sh-title-card> -->
						<!-- 推荐商品 -->
						<!-- <sh-hot-goods></sh-hot-goods> -->
					</scroll-view>
				</scroll-view>
			</view>
			<view class="foot_box"></view>
			<!-- 骨架屏 -->
			<app-skeleton :showSkeleton="!template"></app-skeleton>
			<!-- 登录提示 
			<app-login-modal></app-login-modal>-->
			<!-- 自定义底部导航 -->
			<!-- <app-tabbar></app-tabbar> -->
			<!-- 关注弹窗 -->
			<app-float-btn></app-float-btn>
			<!-- 连续弹窗提醒 -->
			<app-notice-modal v-if="!showPrivacy && showNoticeModal"></app-notice-modal>
			<!-- 隐私协议 -->
			<!-- #ifdef APP-PLUS -->
			<view class="modal-wrap">
				<app-modal v-model="showPrivacy">
					<block slot="modalContent">
						<view class="service-contract-wrap">
							<image class="service-head-img" src="/static/imgs/modal/servece_head.png" mode="widthFix">
							</image>
							<view class="service-title">用户隐私协议概况</view>
							<view class="service-content ">
								感谢您使用，我们非常重视您的个人信息和隐私保护，在您使用服务前，请仔细阅读
								<text style="color: #EAB866;"
									@tap="jump('/pages/public/richtext', { id: 2 })">《隐私协议》</text>
								，我们将会严格按照经您同意的各项条款使用您的个人信息，以便为您提供更好的服务。
							</view>
							<view class="service-tip ">如您同意此条款，请点击“同意”并开始使用我们的产品和服务，我们将尽全力保护您的个人信息安全。</view>
							<view class="btn-box x-c"><button class="cu-btn agree-btn" @tap="Agree">知道了</button></view>
						</view>
					</block>
				</app-modal>
			</view>
			<!-- #endif -->
		</view>
	</view>
</template>
<script>
	import shBanner from './components/sh-banner.vue';
	import shHotGoods from './components/sh-hot-goods.vue';
	import shTitleCard from './components/sh-title-card.vue';
	import fzCircuitMeal from '@/components/fz-circuit-card/fz-circuit-meal.vue';
	import appNoticeModal from '@/components/app-notice-modal/app-notice-modal.vue';
	// #ifdef MP-WEIXIN
	import {
		HAS_LIVE
	} from '@/env';
	// #endif
	import {
		mapMutations,
		mapActions,
		mapState
	} from 'vuex';
	// #ifdef H5
	import html2canvas from '@/common/utils/sdk/html2canvas.js';
	let listenMove = document.body; //禁止手机h5下拉刷新带动整个页面。
	let handle = function(e) {
		e.preventDefault();
	};
	// #endif

	export default {
		components: {
			shBanner,
			shHotGoods,
			fzCircuitMeal,
			appNoticeModal,
			shTitleCard,
		},
		data() {
			return {
				bgcolor: 'azure',
				// #ifdef MP-WEIXIN
				HAS_LIVE: HAS_LIVE,
				// #endif
				mode: '',
				//hHeight: '0',
				goodsList: [],
				showPrivacy: false,
				showNoticeModal: false,
				isLoading: false, //loading和空白页。
				triggered: false, //下拉刷新
				_freshing: false, //下拉刷新状态
				emptyData: {
					img: '/static/imgs/empty/template_empty.png',
					tip: '暂未找到模板，赶快去装修吧~'
				}
			};
		},
		computed: {
			...mapState({
				initData: state => state.init.initData,
				template: state => state.init.templateData?.home,
				hasTemplate: state => state.init.hasTemplate,
				/* cartNum: state => state.cart.cartNum, */
				userInfo: state => state.user.userInfo,
			}),
			popupIndex() {
				if (this.initData.popup) {
					return this.initData.popup.content.index;
				}
			},
			info() {
				if (this.initData.info) {
					return this.initData.info;
				}
			}
		},
		onPullDownRefresh() {
			this.init();
		},
		onLoad(options) {
			// #ifdef APP-VUE
			console.log('是否同意隐私协议', plus.runtime.isAgreePrivacy());
			if (!plus.runtime.isAgreePrivacy()) {
				this.showPrivacy = true;
				this.showNoticeModal = false;
			}
			// #endif
			console.log(this.userInfo)
			console.log()
			console.log(this.userInfo.length)
			console.log(this.userInfo.length==0 || this.userInfo[4] =='')
			
		},
		onShow() {
			/* this.$store.commit('CART_NUM', this.cartNum); */
			// #ifndef MP-WEIXIN
			/* if (this.info && this.info.name) {
				uni.setNavigationBarTitle({
					title: this.info.name
				});
			} */
			// #endif
			console.log("进入主页了")
			setTimeout(()=>{
				this.getGoodsList();
			},2000)
		},
		methods: {
			jumpToMiniProgram(){
				uni.navigateToMiniProgram({
				    appId: 'wxc7c445137eaf0b62',//被跳转的appId
				    path: 'pages/index/index',//要跳转的目标小程序（B小程序）的路径
				    extraData: {},
					envVersion: 'release', //跳转的版本：develop（开发版），trial（体验版），release（正式版）
					success(res) {
					    // 打开成功
					    console.log(res)
					},
					fail(res) {
				        // 打开失败
					    console.log(res)
					}
				})
			},
			//详情
			toCouponDetail(val) {
				let obj = {};
				obj.detail = JSON.stringify(val);
				obj.type = 0;
				this.jump('/pages/index/videoGame', obj);
			},
			getGoodsList() {
				let that = this;
				that.goodsList = []
				that.loadStatus = 'loading';
				let params = {
					data:{
						"FilterString": "FDocumentStatus ='C' and FCustomerID.FNumber ="+this.userInfo[6]+" and FOutStatus='待收货'",
						"FormId": "SAL_OUTSTOCK",
						"OrderString": "FBillNo ASC",//FEntity_FEntryId,FMaterialId.FNumber,FMaterialId.FName,FMaterialId.FSpecification,FSaleOrgId.FNumber,FSaleOrgId.FName,FUnitID.FNumber,FUnitID.FName,FRealQty,FSrcBillNo,FID,FOutStatus,FMateriaModel
						"FieldKeys": "FBillNo,FCustomerID.FNumber,FCustomerID.FName,FApproveDate",
						"Limit": "10"
					}
				}
				that.$api('executeBillQuery', params,1).then(res => {
					let reso = res[0];
					if (res.length>0) {
						that.isLoading = false;
						that.goodsList = res;
						that.loadStatus = 'over';
					}else{
						uni.showToast({
							icon: 'none',
							title: reso[0]['Result']['ResponseStatus']['Errors'][0]['Message']
						})
					}
				});
			},
			/* ...mapMutations(['CART_NUM']), */
			...mapActions(['getAppInit', 'getTemplate', 'getUserInfo']),
			// 初始化
			init() {
				return Promise.all([this.getAppInit(), this.getTemplate(), this.getUserInfo()]).then(() => {
					uni.stopPullDownRefresh();
				});
			},
			// 获取轮播背景色
			getbgcolor(e) {
				this.bgcolor = e;
			},
			// 路由跳转
			jump(path, parmas) {
				this.$Router.push({
					path: path,
					query: parmas
				});
			},
			// #ifdef APP-PLUS
			// 同意协议
			Agree() {
				plus.runtime.agreePrivacy();
				this.showPrivacy = false;
			},
			// #endif
		}
	};
</script>

<style lang="scss">
	// 标题搜索栏
	.active {
		// 动画时间跟随轮播组件动画时间
		transition: all linear 0.5s;
	}

	// 服务协议
	.modal-wrap {
		/deep/ .cu-modal {
			z-index: 99999;
		}
	}
.goods-list {
	flex-wrap: wrap;
	.goods-item {
		width: 100%;
	}
}
	.box-head {
		color: #1E1F21;
		image {
			width: 100rpx;
			height: 80rpx;
		}
		.box-left{
			text{
				line-height: 80rpx;
			}
		}
		.box-right{
			text{
				line-height: 80rpx;
			}
		}
	}

	.content-box {
		width: 100%;
		height: auto;
		
		overflow: hidden;
		position: relative;

		.cont-tier {
			.tier-left {
				image {
					margin-left: 20rpx;
					width: 80rpx;
					height: 80rpx;
				}
			}

			.tier-center {
				width: 400rpx;
				text-align: left;

				.cent-tip {
					width: 210rpx;
					border-radius: 0 30rpx 30rpx 25rpx;
					padding: 3rpx;
					color: #8D9097;
				}

				.cent-name {
					color: #1E1F21;
					font-size: 32rpx;
				}

				.manage-name {
					border-radius: 10rpx;
					background-color: #1E1F21;
					color: #D1A786;
					padding: 1rpx 10rpx 1rpx 10rpx;

				}
			}

			.tier-right {
				line-height: 80rpx;
				padding-right: 10rpx;	
				button {
					border-radius: 30rpx;
					background: #3D7DF2;
				}
			}
			
		}

		.tag-star {
			position: absolute;
			right: 0;
			top: 0;
			z-index: 2;
			width: 0;
			height: 0;
			border-top: 60upx solid #ffe4b5;
			border-left: 60upx solid transparent;

			text {
				top: -55upx;
				left: -32upx;
				position: absolute;
				z-index: 999;
				display: inline-block;
			}
		}
	}

	.service-contract-wrap {
		background-color: #fff;
		position: relative;
		left: 50%;
		transform: translateX(-50%);
		width: 610rpx;
		min-height: 850rpx;
		border-radius: 20rpx;

		.service-title {
			font-size: 35rpx;
			font-family: PingFang SC;
			font-weight: bold;
			color: rgba(255, 255, 255, 1);
			line-height: 42rpx;
			background: linear-gradient(180deg, rgba(62, 48, 25, 1) 0%, rgba(109, 80, 40, 1) 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			margin-bottom: 30rpx;
		}

		.service-content {
			text-align: left;
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(102, 102, 102, 1);
			line-height: 50rpx;
			padding: 0 40rpx;
		}

		.service-tip {
			text-align: left;
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: rgba(154, 154, 154, 1);
			line-height: 50rpx;
			padding: 0 40rpx;
		}

		.btn-box {
			padding: 40rpx;

			.cancel-btn {
				width: 248rpx;
				height: 70rpx;
				border: 1rpx solid rgba(234, 182, 99, 1);
				border-radius: 35rpx;
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(234, 182, 99, 1);
				background-color: #fff;
			}

			.agree-btn {
				width: 300rpx;
				height: 70rpx;
				background: linear-gradient(90deg, rgba(233, 181, 97, 1), rgba(238, 204, 138, 1));
				border-radius: 35rpx;
				font-size: 28rpx;
				font-family: PingFang SC;
				font-weight: 500;
				color: rgba(255, 255, 255, 1);
			}
		}

		.ic-hide {
			position: absolute;
			font-size: 50rpx;
			bottom: -100rpx;
			z-index: 11;
			color: #fff;
			left: 50%;
			transform: translateX(-50%);
		}
	}

	.head_box {
		width: 750rpx;
		// background: #fff;
		transition: all linear 0.3s;

		/deep/.cuIcon-back {
			display: none;
		}

		.nav-title {
			font-size: 38rpx;
			font-family: PingFang SC;
			font-weight: 500;
		}
	}
</style>