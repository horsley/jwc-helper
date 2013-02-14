<?
include_once(dirname(__FILE__) . '/vc_recognize.php');
if (isset($_REQUEST['pic']) && !empty($_REQUEST['pic'])) {
	$pic = $_REQUEST['pic'];
    //file_put_contents("1.png", $pic . PHP_EOL, FILE_APPEND);
    $pic = substr($pic, 22);
    //file_put_contents("1.png", $pic . PHP_EOL, FILE_APPEND);
    $pic = str_replace(' ', '+', $pic);
    //file_put_contents("1.png", $pic . PHP_EOL, FILE_APPEND);
	$pic = base64_decode($pic);
    //file_put_contents("1.png", $pic . PHP_EOL, FILE_APPEND);

	$result = vc_recognize(vc2str($pic));
    echo $result ? "{\"result\":\"$result\"}" : '{"result":false}';

} else {
	header("Location: http://weibo.com/horsley");
}
/*
<!--data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAUCAYAAADyWA/8AAABQElEQVRIS2Nk2P//P8MQBIyjDqdzrI2GOJ0DnGH4hfitWDWsgai2+BZYfE53CoPdpUNg9iE9O4aU0jlw9TC9MLXIBuGTIyXWcIY4Pgu6Z5QylKzsYcjJnwK2a8rEHIae8BKG0oxuMH/QOvxwni2D+PuXDLAQBTn0paA4g+2kw4Pb4eghio8fs3sJQ92iJoaN1v7gGEFWiy5H86RCrMMja5czLG+ORMkDML3Y5KjmcNUntxluy6iimAdKHsQ4HKYXOQnB0j8uOao5HGQQMSUDNo+AHAcDjv37GQ4YOMDTPy45mjuc2MzZFFcHTt/YMi42OZo7vGppG0PrnGqiikNY0Vmd0srQFl2FkszQ5WjucJAF6+qCGHTuXyGqAoLFkP2EgwwHC+zBemBJEFnuubAk0W4fflU+0V4fIIWjIU7vgAcAExkc6GENDd0AAAAASUVORK5CYII=-->
*/