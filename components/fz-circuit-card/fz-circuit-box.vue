<template>
	<view class="goods-box">
		<view class="content-box">
			<text v-if="isTag && detail.activity" class="tag-star"><text class="lg text-red cuIcon-favorfill"></text></text>
			<view class="cont-tier flex flex-wrap justify-between">
				<view class="tier-center">
					<view class=" text-bold">{{detail[6]}}</view>
					<view class="cent-tip ">规格型号：<text class="text-black">{{detail[7]}}</text></view>
					<view class="flex cent-bottom">
						<view >单位：<text class="text-black">{{detail[11]}}</text></view>
						<view class="text-black">X {{detail[12]}}</view>
					</view>
				</view>
				<view class="tier-right text-bold text-xxl">
					
				</view>
			</view>
		</view>
	</view>
</template>
<script>
export default {
	name: 'fzCircuitCard',
	components: {},
	data() {
		return {
			goodsList: [],
			swiperCurrent: 0,
			cinemaKeysWord: [],
			tagPath: {
				groupon: '/static/imgs/groupon_tag.png',
				seckill: '/static/imgs/seckill_tag.png'
			}
		};
	},
	
	props: {
		isTag: {
			type: [Boolean, String],
			default: false
		},
		tabId: '',
		pickType: 0,
		colorItem: '',
		filmId: {
			type: String,
			default: ''
		},
		detail: {
			type: Array,
			default: []
		}
	},
	mounted() {
		this.info = { ...this.detail}
	},
	computed: {},
	methods: {
		swiperChange(e) {
			this.swiperCurrent = e.detail.current;
		},
		// 路由跳转
		jump(path, parmas) {
			this.$Router.push({
				path: path,
				query: parmas
			});
		}
	}
};
</script>

<style scoped lang="scss">
// 轮播

.swiper-box,
.carousel {
	width: 100%;
	height: 170rpx;
	position: relative;
	.carousel-item {
		width: auto !important;
		height: 100%;
		// padding: 0 28upx;
	}
}
.goods-box {
	margin-left: 10rpx;
	width: 730rpx;
	border-radius: 10rpx;
	overflow: hidden;
	.content-box {
		width: 100%;
		height: auto;
		overflow: hidden;
		position: relative;
		.cont-tier {
			background-color: white;
			margin-top: 15rpx;
			.tier-center{
				padding: 30rpx 0 20rpx 20rpx;
				width: 690rpx;
				text-align: left;
				color:#1E1F21;
				.cent-tip{
					line-height: 60rpx;
					color:#8D9097;
				}
				.cent-bottom{
					color:#8D9097;
					line-height: 50rpx;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
				}
			}
			.tier-right{
				line-height: 140rpx;
				padding-right: 20rpx;
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
	.min-goods {
		clear: both;
		width: 190rpx;
		margin: 20rpx;
		height: 130rpx;
		background: #F8F8FF;
		box-shadow: 0px 1px 1px 0px #ccc;
		line-height: 35rpx;
		margin-top: 0;
		border-radius: 10rpx;
		.price-box {
			width: 100%;
			margin-top: 10rpx;
			padding-left: 10rpx;
			.y-f{
				.seckill-current {
					width: 100%;
					padding-top: 5rpx;
					font-family: PingFang SC;
				}.seckill-lau {
					width: 100%;
					padding-top: 5rpx;
					margin-left: -18rpx;
					-webkit-transform: scale(0.9);
					font-family: PingFang SC;
				}
				.original {
					width: 100%;
					margin-left: -18rpx;
					-webkit-transform: scale(0.9);
					padding-top: 5rpx;
					font-family: PingFang SC;
				}
				.cr_name {
					font-size: 20rpx;
				}
			}
		}
		.tagb text {
			font-size: 22rpx;
			font-weight: bold;
		}
		.title {
			font-size: 26rpx;
		}
	}
}
</style>
